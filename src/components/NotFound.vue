<template>
  <div class="container">
    <div class="d-flex py-5 align-items-center">
      <div class="w-50 text-center">
        <img
          class="image-error"
          src="https://cdn0.fahasa.com/media/fahasa_web_image/404_web_image.png"
          alt="404"
          width="50%"
        />
      </div>

      <div class="w-50 fs-4">
        <p class="title-error">Oops!</p>
        <p class="desc-error">Rất tiếc, chúng tôi không thể tìm thấy những gì bạn đang tìm kiếm.</p>
        <p class="error-code">Error code: 404</p>
        <RouterLink to="/" class="btn-back-home">Quay lại trang chủ </RouterLink>
      </div>
    </div>
  </div>
</template>
