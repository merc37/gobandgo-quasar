<template>
  <q-page class="flex flex-center">
    <q-resize-observer @resize="onResize" />
    <gmap-map
      :center="{lat:40.877666, lng:-74.023278}"
      :options="{
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false
      }"
      :style="'width: ' + pageSize.width + 'px; height: ' + pageSize.height + 'px;'"
      :zoom="15"
      map-type-id="roadmap">
      <gmap-marker
        v-for="(marker, index) in markers"
        :key="index"
        :position="{lat: marker.geopoint.latitude, lng: marker.geopoint.longitude}"
        :clickable="true"
        @click="openDrawer(marker)" />
    </gmap-map>

    <MarkerDrawer
      v-model="drawerOpen"
      :marker="clickedMarker"
      :photos="markerPhotos"
      :loading="photosLoading" />

    <Spinner v-if="markersLoading" />
  </q-page>
</template>

<script>
import MarkerDrawer from '../components/MarkerDrawer';
import Spinner from '../components/Spinner';
import ResizeMixin from '../mixins/ResizeMixin';

export default {
  components: {MarkerDrawer, Spinner},
  mixins: [ResizeMixin],
  data() {
    return {
      markers: [],
      clickedMarker: {},
      markerPhotos: [],
      drawerOpen: false,
      markersLoading: false,
      photosLoading: false
    };
  },
  methods: {
    async openDrawer(marker) {
      this.clickedMarker = marker;
      this.markerPhotos = [];
      this.drawerOpen = true;
      this.photosLoading = true;
      this.markerPhotos = await this.getPhotoUrls(marker.id);
      this.photosLoading = false;
    },
    async getPhotoUrls(markerId) {
      const fileList = (await this.$firestorage.ref(markerId).listAll()).items;
      const photos = fileList.map(async (file) => {
        return await file.getDownloadURL();
      });
      return await Promise.all(photos);
    }
  },
  async mounted() {
    this.markersLoading = true;
    await this.$bind('markers', this.$firestore.collection('markers').where('paid', '==', true), {maxRefDepth: 0});
    this.markersLoading = false;
  }
};
</script>
