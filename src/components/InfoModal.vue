<template>
  <q-dialog
    :value="value"
    :maximized="$q.screen.width < 768"
    @input="$emit('input', $event)">
    <q-card
      class="bg-primary text-secondary">
      <q-card-section>
        <div class="row justify-between">
          <div class="col-auto">
            <div class="text-h5">
              <div v-if="$q.screen.width >= 768">
                Bogota Townwide Garage Sale
              </div>
              <div v-else>
                <div>
                  Bogota Townwide
                </div>
                <div>
                  Garage Sale
                </div>
              </div>
            </div>
            <div class="text-subtitle1">
              October 3, 2020
            </div>
          </div>
          <q-btn
            icon="close"
            unelevated
            dense
            color="primary"
            class="self-start"
            @click="$emit('input', false)" />
        </div>
      </q-card-section>
      <q-card-section>
        <div class="text-body1">
          Sign up to get:
          <ul>
            <li>
              A marker on this map, with pictures and a description promoting your sale.
            </li>
            <li>
              A BHS Band supporter sign for your lawn to send buyers to you.
            </li>
            <li>
              A listing in The Record's Garage Sale section the week before the sale.
            </li>
            <li>
              A notice on Craigslist North Jersey in the days before the sale.
            </li>
          </ul>
        </div>
      </q-card-section>
      <q-card-actions>
        <div class="text-caption">
          Contact gobandgo.info@gmail.com for questions.
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true
    }
  }
};
</script>