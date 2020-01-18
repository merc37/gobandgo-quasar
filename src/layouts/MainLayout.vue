<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-purple-10">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>GoBandGo</q-toolbar-title>

        <q-btn flat dense icon="more_vert">
          <q-menu auto-close>
            <q-list style="min-width: 100px">
              <q-item clickable v-ripple>
                <q-item-section>Sign In</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" overlay show-if-above>
      <q-list separator>
        <q-item v-ripple clickable>
          <q-item-section avatar>
            <q-icon name="map" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Map</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-ripple clickable>
          <q-item-section avatar>
            <q-icon name="group_add" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Sign Up</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  data() {
    return {
      leftDrawerOpen: false
    };
  }
};
</script>
