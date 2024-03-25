<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps({
  item: {
    type: Object,
    required: true
  },
  handleShowMenu: {
    type: Function,
    required: true
  },
  isAuthor: {
    type: Boolean
  }
})
</script>

<template>
  <b-card img-top no-body style="width: 20%" class="m-2" @click="handleShowMenu()">
    <RouterLink
      :to="{ name: 'book-detail', params: { name: item.slug } }"
      class="text-decoration-none text-black d-block h-100"
    >
      <b-card-body>
        <img
          width="100px"
          :src="item.thumbnail ? item.thumbnail : item.photo"
          :alt="item.title"
          bottom
        />

        <b-card-title style="font-size: 14px" class="mt-2 text-truncate">
          {{ item.name }}
        </b-card-title>

        <template v-if="isAuthor">
          <b-card-text class="text-start text-truncate">
            <span class="fw-bold" style="color: #7a7e7f">{{ item.description }}</span>
          </b-card-text>
        </template>

        <template v-else>
          <b-card-text class="text-end">
            Thể loại:
            <span class="fw-bold text-capitalize" style="color: #7a7e7f"
              >{{ item.category.name }}
            </span>
          </b-card-text>
        </template>
      </b-card-body>
    </RouterLink>
  </b-card>
</template>

<style scoped>
.card:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
  cursor: pointer;
}
</style>
