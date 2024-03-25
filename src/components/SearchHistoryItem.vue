<template>
  <RouterLink
    :to="{ name: 'search', query: { 'tu-khoa': searchItem.text } }"
    class="HS-item px-3 d-flex justify-content-between align-items-center"
    @click="handleShowSearchHistory()"
  >
    <p class="d-inline-block m-0 fs-6 text-black">
      {{ searchItem.text }}
    </p>
    <span class="fs-3 text-black" @click="(e: Event) => e.stopPropagation()"
      ><i class="fa-solid fa-xmark"></i
    ></span>
  </RouterLink>
</template>

<script setup lang="ts">
defineProps({
  searchItem: {
    type: Object,
    required: true
  },
  handleShowSearchHistory: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
.HS-item:hover {
  background-color: #000;
  cursor: pointer;
}

.HS-item:hover p,
.HS-item:hover span {
  color: white !important;
}

.HS-item span i:hover {
  color: red !important;
}
</style>
