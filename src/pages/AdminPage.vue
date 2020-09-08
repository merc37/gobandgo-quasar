<template>
  <q-page class="flex">
    <q-table
      class="full-width"
      :columns="columns"
      :data="data"
      :loading="loading"
      hide-bottom>
      <template v-slot:loading>
        <q-inner-loading :showing="loading"> 
          <Spinner />
        </q-inner-loading>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import Spinner from '../components/Spinner';

const markerColumns = [
  {name: 'firstName', label: 'First Name', field: row => row.user.firstName, sortable: true},
  {name: 'lastName', label: 'Last Name', field: row => row.user.lastName, sortable: true},
  {name: 'address', label: 'Address', field: 'address'},
  {name: 'email', label: 'Email', field: row => row.user.email},
  {name: 'paid', label: 'Paid', field: 'paid', sortable: true}
];

export default {
  components: {Spinner},
  data() {
    return {
      data: [],
      columns: markerColumns,
      loading: false,
      currentUserData: null
    };
  },
  async mounted() {
    this.loading = true;
    await this.$bind('currentUserData', this.$firestore.collection('users').doc(this.$fireauth.currentUser.uid));
    if(!this.currentUserData.admin) {
      this.loading = false;
      this.$router.push({path: '/map'});
      return;
    }
    await this.$bind('data', this.$firestore.collection('markers'));
    this.loading = false;
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