<script setup lang="ts">
import { ref } from 'vue'
import { MDBCarousel } from 'mdb-vue-ui-kit'

const items4 = [
  {
    src: 'https://nhasachphuongnam.com/images/promo/274/Banner-%C4%90%E1%BB%8Dc-S%C3%A1ch-Th%C3%A1ng-3.jpg',
    alt: '...'
  },
  {
    src: 'https://nhasachphuongnam.com/images/promo/273/Banner-Bi%E1%BA%BFm-Ho%E1%BA%A1-Tr%C3%AAn-B%C3%A1o-Ch%C3%AD-SG-Tr%C6%B0%E1%BB%9Bc-1975.jpg',
    alt: '...'
  },
  {
    src: 'https://nhasachphuongnam.com/images/promo/274/Banner-S%C3%A1ch-Nguy%E1%BB%85n-Nh%E1%BA%ADt-%C3%81nh---20240313-890x396.jpg',
    alt: '...'
  }
]

const sideImg = [
  {
    src: 'https://cdn0.fahasa.com/media/magentothem/banner7/Chuyenketuonglai_SocialPost_840x320.jpg',
    alt: '...'
  },
  {
    src: 'https://nhasachphuongnam.com/images/promo/274/Banner-%C4%90%E1%BB%8Dc-S%C3%A1ch-Th%C3%A1ng-3-Giam-30-890x396.jpg',
    alt: '...'
  }
]

const carousel4 = ref<number>(0)
</script>

<template>
  <div class="d-flex gap-4 mb-2 justify-content-between">
    <div style="width: 840px">
      <MDBCarousel v-model="carousel4" :items="items4" :interval="2000" innerClass=" rounded-5" />
    </div>
    <div style="width: 392px" class="gap-4 d-flex flex-column justify-content-between">
      <img
        :src="sideImg[0].src"
        alt=""
        class="rounded-5"
        style="height: 50%"
        width="100%"
        loading="lazy"
      />
      <img
        :src="sideImg[1].src"
        alt=""
        class="rounded-5 object-fit-cover"
        style="height: calc(320px - 50%)"
        width="100%"
        loading="lazy"
      />
    </div>
  </div>
</template>
