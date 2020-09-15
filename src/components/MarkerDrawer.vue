<template>
  <q-drawer
    :value="value"
    side="right"
    overlay
    no-swipe-open
    no-swipe-close
    elevated
    :width="width"
    @input="$emit('input', $event)">
    <div
      class="bg-accent row items-center"
      style="height: 50px;">
      <div
        class="col q-pa-sm text-primary text-weight-bolder"
        style="font-size: 20px;">
        {{ marker.address }}
      </div>
      <div class="col-auto text-right">
        <q-btn
          icon="close"
          flat
          dense
          size="20px"
          color="secondary"
          round
          @click="$emit('input', false)" />
      </div>
    </div>

    <div
      style="height: 40%;"
      class="relative-position">
      <q-carousel
        v-if="photos.length > 1 && !loading"
        v-model="slide"
        swipeable
        animated
        transition-prev="slide-right"
        transition-next="slide-left"
        infinite
        :arrows="photos.length > 1"
        height="100%">
        <q-carousel-slide
          v-for="(photo, index) in photos"
          :key="index"
          :name="index"
          :img-src="photo" />
      </q-carousel>
      <div
        v-if="photos.length < 1 && !loading"
        class="row items-center justify-center full-height"
        style="font-size: 16px; font-weight: 600;">
        No Photos Found
      </div>
      <Spinner
        v-if="loading"
        absolute />
    </div>
    <q-separator />
    <div class="q-pa-sm">
      {{ marker.message }}
    </div>
  </q-drawer>
</template>

<script>
import Spinner from './Spinner';

export default {
  components: {Spinner},
  props: {
    value: {
      type: Boolean,
      required: true
    },
    marker: {
      type: Object,
      required: true
    },
    photos: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      slide: 0
    };
  },
  computed: {
    width() {
      return 400 <= window.innerWidth ? 400 : window.innerWidth;
    }
  }
};
</script>

<style scoped>

</style>