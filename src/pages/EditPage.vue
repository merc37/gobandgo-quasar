<template>
  <q-page class="flex flex-center">
    <q-card
      class="q-ma-md"
      style="width: 100%; max-width: 500px;">
      <q-card-section class="text-h6">
        Edit Marker
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="markers[0].message"
          label="What are you selling?"
          type="textarea" />
        <div class="q-mt-sm relative-position">
          <file-uploader
            ref="fileUploader"
            label="Add/Remove Photos"
            :filter="checkFileType"
            accept=".jpg, image/*"
            bordered
            multiple
            hide-upload-btn
            class="full-width"
            :disable="addingFiles"
            @added="onAddFiles"
            @removed="onRemoveFiles" />
          <Spinner
            v-if="photosLoading || addingFiles"
            absolute />
        </div>
      </q-card-section>

      <q-card-actions
        align="right">
        <q-btn
          color="primary"
          flat
          label="See Marker"
          @click="onSeeMarker" />
      </q-card-actions>
    </q-card>

    <MarkerDrawer
      v-model="drawerOpen"
      :marker="markers[0] || {}"
      :photos="photoFiles.urls"
      :loading="photosLoading" />

    <Spinner v-if="markerLoading" />
  </q-page>
  <!-- maybe wait to upload text -->
</template>

<script>
import MarkerDrawer from '../components/MarkerDrawer';
import Spinner from '../components/Spinner';
import FileUploader from '../components/FileUploader';

export default {
  components: {MarkerDrawer, Spinner, FileUploader},
  data() {
    return {
      drawerOpen: true,
      markers: [],
      photoFiles: {urls: [], files: []},
      markerLoading: false,
      photosLoading: false,
      addingFiles: false,
      initialFileAdd: false
    };
  },
  methods: {
    onSeeMarker() {
      this.drawerOpen = true;
    },
    checkFileType(files) {
      return files.filter(file => file.type.includes('image/'));
    },
    async onAddFiles(files) {
      if(this.initialFileAdd) {
        this.initialFileAdd = false;
        return;
      }
      this.addingFiles = true;
      const uploadTasks = [];
      for(let photo of files) {
        uploadTasks.push(this.$firestorage.ref(this.$fireauth.currentUser.uid + '/' + photo.name).put(photo));
      }
      try {
        await Promise.all(uploadTasks);
      } catch(exception) {
        console.error('Failed to upload photo: ' + exception.message);
          this.addingFiles = false;
          return;
      }
      this.addingFiles = false;
    },
    onRemoveFiles(files) {
      files.forEach((file) => {
        this.$firestorage.ref(`${this.$fireauth.currentUser.uid}/${file.name}`).delete();
      });
    },
    async getPhotos(markerId) {
      const fileList = (await this.$firestorage.ref(markerId).listAll()).items;
      const photos = fileList.map(async (file) => {
        return await file.getDownloadURL();
      });
      const fileMetadata = fileList.map(async (file) => {
        return await file.getMetadata();
      });
      const urls = await Promise.all(photos);
      const fileNames = await Promise.all(fileMetadata.map(async (data) => {
        return (await data).name;
      }));
      const files = await Promise.all(urls.map(async (url, index) => {
        const file = await this.downloadFile(url);
        file.name = fileNames[index];
        return file;
      }));
      return {urls, files};
    },
    async downloadFile(url) {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = () => {
          return resolve(xhr.response);
        };
        xhr.open('GET', url);
        xhr.send();
      });
    }
  },
  async mounted() {
    this.markerLoading = true;
    const userKey = this.$fireauth.currentUser.uid;
    await this.$bind('markers', this.$firestore.collection('markers').where('userKey', '==', userKey));
    this.markerLoading = false;
    this.photosLoading = true;
    this.photoFiles = await this.getPhotos(this.markers[0].id);
    if(this.photoFiles.files.length > 0) this.initialFileAdd = true;
    this.$refs.fileUploader.addFiles(this.photoFiles.files);
    this.photosLoading = false;
  },
  beforeRouteEnter (to, from, next) {
    return next(vm => {
      const currentUser = vm.$fireauth.currentUser;
      if(!currentUser || currentUser.isAnonymous) {
        return next(from);
      }
      return next();
    });
  }
};
</script>

<style scoped>

</style>