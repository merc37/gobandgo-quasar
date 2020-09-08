<template>
  <q-layout view="lHr lpr lFr">
    <q-header
      class="bg-primary"
      elevated>
      <q-toolbar>
        <q-btn
          aria-label="Menu"
          dense
          flat
          icon="menu"
          round
          @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title>GoBandGo</q-toolbar-title>

        <q-btn
          dense
          flat
          icon="more_vert">
          <q-menu
            fit
            anchor="bottom right"
            self="top right"
            auto-close>
            <q-list>
              <q-item
                v-if="!signedIn"
                clickable
                @click="openSignIn = true">
                <q-item-section>Sign In</q-item-section>
              </q-item>
              <q-item
                v-if="signedIn"
                clickable
                @click="signOut()">
                <q-item-section>Sign Out</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen">
      <div
        class="bg-primary full-width text-accent row flex flex-center text-h3"
        style="height: 100px;">
        GoBandGo
      </div>
      <q-list separator>
        <q-item
          v-ripple
          active-class="text-accent"
          class="text-primary"
          clickable
          to="/map"
          @click="leftDrawerOpen = !leftDrawerOpen">
          <q-item-section avatar>
            <q-icon name="map" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Map</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="!signedIn"
          v-ripple
          active-class="text-accent"
          class="text-primary"
          clickable
          to="/signup"
          @click="leftDrawerOpen = !leftDrawerOpen">
          <q-item-section avatar>
            <q-icon name="group_add" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Sign Up</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="signedIn && !isAdmin"
          v-ripple
          active-class="text-accent"
          class="text-primary"
          clickable
          to="/edit">
          <q-item-section avatar>
            <q-icon name="edit" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Edit</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="signedIn && isAdmin"
          v-ripple
          active-class="text-accent"
          class="text-primary"
          clickable
          to="/admin">
          <q-item-section avatar>
            <q-icon name="supervisor_account" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Admin</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view v-if="currentUser" />
      <Spinner
        v-else
        :value="true"
        color="black"
        size="5em" />
    </q-page-container>

    <SignInDialog
      v-model="openSignIn" />
  </q-layout>
</template>

<script>
import SignInDialog from '../components/SignInDialog';
import Spinner from '../components/Spinner';

export default {
  components: { SignInDialog, Spinner },
  data() {
    return {
      leftDrawerOpen: false,
      openSignIn: false,
      currentUser: null,
      currentUserData: null
    };
  },
  computed: {
    signedIn() {
      return this.currentUser && !this.currentUser.isAnonymous;
    },
    isAdmin() {
      return this.currentUserData && this.currentUserData.admin;
    }
  },
  methods: {
    async signOut() {
      await this.$fireauth.signOut();
      await this.$fireauth.setPersistence(this.$fireauth.Auth.Persistence.SESSION);
      await this.$fireauth.signInAnonymously();
      if(!this.$route.path.includes('map')) {
        this.$router.push({path: '/map'});
      }
      this.$q.notify({message: 'Successfully signed out', color: 'positive'});
    }
  },
  mounted() {
    this.$fireauth.onAuthStateChanged(async (user) => {
      this.currentUser = user;
      if(!this.currentUser) {
        await this.$fireauth.setPersistence(this.$fireauth.Auth.Persistence.SESSION);
        await this.$fireauth.signInAnonymously();
      }
      if(this.currentUser && !this.currentUser.isAnonymous) {
        //FIX
        this.$bind('currentUserData', this.$firestore.collection('users').doc(this.currentUser.uid));
      }
    });
  },
};
</script>
