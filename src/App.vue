<script setup lang="ts">
import { RouterView } from 'vue-router'

import PageHeader from './components/PageHeader.vue'
import PageFooter from './components/PageFooter.vue'
</script>

<template>
  <PageHeader />
  <main style="background-color: #f0f0f0">
    <RouterView />
  </main>
  <PageFooter />
</template>

<style>
#app {
  font-family: Roboto, Helvetica, Arial, sans-serif;
}
</style>
