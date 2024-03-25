<script setup lang="ts">
import { MDBCard, MDBCardBody, MDBCardTitle, MDBCardText, MDBCardImg } from 'mdb-vue-ui-kit'
import { RouterLink } from 'vue-router'

const { book } = defineProps({
  book: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <MDBCard style="width: 23%" class="m-4 card">
    <RouterLink :to="{ name: 'book-detail', params: { name: book.slug } }" class="text-black">
      <MDBCardImg top :src="book.thumbnail" :alt="book.name" />
      <MDBCardBody>
        <MDBCardTitle>{{ book.name }}</MDBCardTitle>
        <MDBCardText> {{ book.authorId.name }}</MDBCardText>
        <MDBCardText class="text-body-tertiary text-truncate"> {{ book.description }} </MDBCardText>
      </MDBCardBody>
    </RouterLink>
  </MDBCard>
</template>

<style scoped>
.card:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
  cursor: pointer;
}
</style>
