export default {
  data() {
    return {
      pageSize: { width: 100, height: 100 },
    };
  },
  methods: {
    onResize(size) {
      this.pageSize = size;
    }
  }
};