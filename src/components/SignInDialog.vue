<template>
  <q-dialog
    ref="dialog"
    :value="value"
    @input="$emit('input', $event)"
    @show="$refs.emailInput.focus()">
    <q-card class="relative-position q-pa-md">
      <q-card-section>
        <div class="text-h6">
          Sign In to GoBandGo
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          ref="emailInput"
          v-model="email"
          autofocus
          label="Email"
          stack-label
          type="email"
          :error="$v.email.$error || emailError"
          :error-message="emailError ? 'Email not found' : 'Invalid Email'"
          @input="emailError = false"
          @keyup.enter.stop.prevent="onSignIn" />
        <q-input
          v-model="password"
          label="Password"
          stack-label
          type="password"
          :error="$v.password.$error || passwordError"
          :error-message="passwordError ? 'Password incorrect' : 'Password is required'"
          @input="passwordError = false"
          @keyup.enter.stop.prevent="onSignIn" />
        <div
          v-if="otherError"
          class="text-negative text-bold">
          Incorrect login information
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          color="primary"
          flat
          label="Sign In"
          @click="onSignIn" />
      </q-card-actions>

      <div
        v-if="loading"
        class="row items-center justify-center absolute-center">
        <q-spinner
          color="primary"
          size="3em" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import {required, email} from 'vuelidate/lib/validators';

export default {
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      emailError: false,
      passwordError: false,
      otherError: false
    };
  },
  methods: {
    async onSignIn() {
      this.loading = true;
      this.$v.$touch();
      
      if(this.$v.$invalid) {
        this.loading = false;
        return;
      }
      
      try {
        await this.$fireauth.setPersistence(this.$fireauth.Auth.Persistence.SESSION);
        await this.$fireauth.signInWithEmailAndPassword(this.email, this.password);
        this.$q.notify({message: 'Successfully signed in', color: 'positive', icon: 'check_circle'});
        this.$refs.dialog.hide();
      } catch(error) {
        this.onSignInError(error);
      }
      this.loading = false;
    },
    onSignInError(error) {
      this.$q.notify({message: 'Error signing in', color: 'negative', icon: 'error'});
      this.$refs.dialog.shake();
      if(error.code === 'auth/user-not-found') {
        this.emailError = true;
        return;
      }
      if(error.code === 'auth/wrong-password') {
        this.passwordError = true;
        return;
      }
      this.otherError = true;
    }
  },
  validations: {
    email: {
      required,
      email
    },
    password: {
      required
    }
  }
};
</script>
