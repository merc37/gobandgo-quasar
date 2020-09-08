<template>
  <q-page class="row items-stretch justify-center">
    <q-card
      class="q-ma-md"
      style="width: 100%; max-width: 500px;">
      <q-card-section class="text-h6">
        Sign Up
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="user.address"
          label="Address"
          autofocus
          :error="$v.user.address.$error || notValidAddress"
          :error-message="addressErrorMessage"
          :hint="addressFieldFocused ? 'Enter a Bogota Address' : null"
          @input="notValidAddress = false"
          @focus="addressFieldFocused = true"
          @blur="addressFieldFocused = false" />
        <q-input
          v-model="user.firstName"
          label="First Name"
          :error="$v.user.firstName.$error"
          error-message="First Name Required" />
        <q-input
          v-model="user.lastName"
          label="Last Name"
          :error="$v.user.lastName.$error"
          error-message="Last Name Required" />
        <q-input
          v-model="user.email" 
          label="Email"
          type="email"
          :error="$v.user.email.$error || emailInUseError"
          :error-message="emailInUseError ? 'Email Already in Use' : 'Invalid Email'"
          @input="emailInUseError = false" />
        <q-input
          v-model="user.password" 
          label="Password"
          type="password"
          :error="$v.user.password.$error"
          :error-message="'Password must be at least ' + minPasswordLength + ' characters long'"
          :hint="passwordFieldFocused ? 'Password should be at least ' + minPasswordLength + ' characters long' : null"
          @focus="passwordFieldFocused = true"
          @blur="passwordFieldFocused = false" />
        <q-input
          v-model="user.message"
          label="What are you selling?"
          type="textarea" />
        <div class="q-mt-sm">
          <q-toggle
            v-model="user.donating"
            label="Donate Now?" />
        </div>
        <div class="q-mt-sm">
          <file-uploader
            ref="fileUploader"
            style="min-height: 320px;"
            label="Add Photos"
            :filter="checkFileType"
            accept=".jpg, image/*"
            bordered
            multiple
            hide-upload-btn
            class="full-width" />
        </div>
      </q-card-section>

      <q-card-actions
        align="right">
        <q-btn
          color="primary"
          flat
          label="Sign Up"
          @click="onSignUp" />
      </q-card-actions>

      <q-inner-loading :showing="loading">
        <q-spinner-gears
          size="50px"
          color="primary" />
      </q-inner-loading>
    </q-card>

    <!-- <q-linear-progress
      class="fixed-bottom"
      size="20px"
      indeterminate>
      <div class="absolute-full flex flex-center">
        <q-badge
          color="accent"
          text-color="primary"
          label="Creating User..." />
      </div>
    </q-linear-progress> -->
  </q-page>
</template>

<script>
import {gmapApi} from 'vue2-google-maps';
import {required, email} from 'vuelidate/lib/validators';
import FileUploader from '../components/FileUploader';

import firebase from 'firebase/app';
const { Timestamp, GeoPoint } = firebase.firestore;

export default {
  components: {FileUploader},
  data() {
    return {
      user: {
        address: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        message: 'Great variety of high quality items for sale',
        donating: true,
        photos: null,
        geopoint: null
      },
      geocoder: null,
      loading: false,
      notValidAddress: false,
      addressLoading: false,
      addressErrorMessage: 'Address Required',
      addressFieldFocused: false,
      minPasswordLength: 6,
      passwordFieldFocused: false,
      emailInUseError: false
    };
  },
  methods: {
    async onSignUp() {
      this.loading = true;
      this.$v.$touch();
      
      if(this.$v.$invalid) {
        this.loading = false;
        return;
      }

      this.notValidAddress = !(await this.isValidAddress(this.user.address));
      if(this.notValidAddress){
        this.loading = false;
        return;
      }
      
      try{
        await this.$fireauth.createUserWithEmailAndPassword(this.user.email, this.user.password);
      } catch(exception) {
        console.error('Failed to create user: ' + exception.message);
        this.emailInUseError = true;
        this.loading = false;
        return;
      }

      const userKey = this.$fireauth.currentUser.uid;

      try{
        await this.$firestore.collection('users').doc(userKey).set({
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          email: this.user.email,
          created: Timestamp.now(),
          updated: Timestamp.now()
        });
      } catch(exception) {
        console.error('Failed to add user to DB: ' + exception.message);
        this.loading = false;
        return;
      }

      let markerKey = '';
      try{
        const marker = (await this.$firestore.collection('markers').add({
          address: this.user.address,
          message: this.user.message,
          geopoint: this.user.geopoint,
          paid: false,
          user: this.$firestore.doc('/users/' + userKey),
          userKey,
          created: Timestamp.now(),
          updated: Timestamp.now()
        }));
        markerKey = marker.id;
      } catch(exception) {
        console.error('Failed to add marker to DB: ' + exception.message);
        this.loading = false;
        return;
      }
      //request.auth.uid == get(userPath(request.resource.data.user.path)).id
      this.user.photos = this.$refs.fileUploader.files;
      const uploadTasks = [];
      for(let photo of this.user.photos) {
        uploadTasks.push(this.$firestorage.ref(markerKey + '/' + photo.name).put(photo));
      }

      try{
        await Promise.all(uploadTasks);
      } catch(exception) {
        console.error('Failed to upload photo: ' + exception.message);
        this.loading = false;
        return;
      }

      this.loading = false;
      this.$q.notify({message: 'Successfully signed up', color: 'positive'});
      this.$router.push({path: '/edit'});
    },
    async geocode(address) {
      if(!this.geocoder) this.geocoder = new this.google.maps.Geocoder();
      const geocodeObject = {
        address: address,
        componentRestrictions: { country: 'US', postalCode: '07603' }
      };
      
      return new Promise((resolve, reject) => {
        this.geocoder.geocode(geocodeObject, (results, status) => {
          if(status == this.google.maps.GeocoderStatus.OK) return resolve(results);
          return reject(status); 
        });
      });
    },
    async isValidAddress(address) {
      this.addressLoading = true && !this.loading;
      let geocode = null;
      try {
        geocode = await this.geocode(address);
      } catch(e) {
        this.addressErrorMessage = 'Address Not in Bogota';
        return false;
      }
      
      if(!geocode || !geocode.length || geocode[0].types.includes('postal_code')) {
        this.addressLoading = false;
        this.addressErrorMessage = 'Address Not in Bogota';
        return false;
      }
      
      const location = geocode[0].geometry.location;
      const geopoint = new GeoPoint(location.lat(), location.lng());

      const addressExists = await this.$firestore.collection('markers').where('geopoint', '==', geopoint).get();

      if(addressExists.docs.length > 0){
        this.addressLoading = false;
        this.addressErrorMessage = 'Address Already Used';
        return false;
      }
      
      this.user.geopoint = geopoint;
      this.addressLoading = false;
      this.addressErrorMessage = 'Address Required';
      return true;
    },
    checkFileType(files) {
      return files.filter(file => file.type.includes('image/'));
    }
  },
  computed: {
    google: gmapApi
  },
  async mounted() {
    await this.$gmapApiPromiseLazy();
  },
  validations: {
    user: {
      address: {
        required
      },
      firstName: {
        required
      },
      lastName: {
        required
      },
      email: {
        required,
        email
      },
      password: {
        required,
        isMinLength(password) {
          return password.length >= this.minPasswordLength;
        }
      },
      message: {
        required
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    return next(vm => {
      const currentUser = vm.$fireauth.currentUser;
      if(currentUser && !currentUser.isAnonymous) {
        return next(from);
      }
      return next();
    });
  }
};
</script>

<style scoped>
</style>
