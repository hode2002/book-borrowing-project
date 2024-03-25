<script setup lang="ts">
import CreatePassword from './CreatePassword.vue'

const { email } = defineProps({
  email: {
    type: String,
    required: true
  }
})
</script>

<template>
  <CreatePassword :email="email" :isCreatePassword="false" />
</template>
