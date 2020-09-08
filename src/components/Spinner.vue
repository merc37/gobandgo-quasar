<template>
  <div
    class="row items-center justify-center"
    :class="{'fixed-center': !absolute, 'absolute-center': absolute}">
    <q-spinner
      :color="color"
      :size="size" />
  </div>
</template>

<script>
export default {
  props: {
    absolute: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'primary'
    },
    size: {
      type: String,
      default: '3em'
    }
  }
};
</script>

<style scoped>

</style>