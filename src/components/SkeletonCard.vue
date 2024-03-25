<script setup lang="ts">
import { MDBCard, MDBCardBody } from 'mdb-vue-ui-kit'
const {
  width = 23,
  direction = 'vertical',
  noImage = false
} = defineProps({
  width: {
    type: Number
  },
  direction: {
    type: String
  },
  noImage: {
    type: Boolean
  }
})
</script>

<template>
  <MDBCard v-if="direction === 'vertical'" :style="{ width: width + '%' }" class="skeleton">
    <div class="skeleton-item-image"></div>
    <MDBCardBody>
      <div class="skeleton-item"></div>
      <div class="skeleton-item"></div>
      <div class="skeleton-item"></div>
    </MDBCardBody>
  </MDBCard>

  <template v-else-if="direction === 'horizontal'">
    <div class="row justify-content-center align-items-center" style="height: 110px">
      <div v-if="noImage === false" class="col-md-3 text-center align-content-center">
        <div class="skeleton-item-image rounded-5" style="height: 80px"></div>
      </div>
      <div class="col-md-8 align-items-center">
        <div class="">
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
        </div>
      </div>
    </div>
  </template>
</template>
<style scoped>
.skeleton {
  background-color: #f0f0f0;
  border-radius: 5px;
  padding: 20px;
}

.skeleton-item-image {
  height: 200px;
  margin-bottom: 10px;
  background-color: #ddd;
  border-radius: 3px;
}

.skeleton-item {
  height: 20px;
  margin-bottom: 10px;
  background-color: #ddd;
  border-radius: 3px;
}
</style>
