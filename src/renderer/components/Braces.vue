<template>
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="18" height="24">
    <path d="M16 8 C 8 8, 8 8, 8 24" :stroke="color" fill="none" v-if="type==='top'"/>
    <path d="M8 0 L 8 24" :stroke="color" fill="none" v-if="type==='middle'"/>
    <path d="M16 16 C 8 16, 8 16, 8 0" :stroke="color" fill="none" v-if="type==='bottom'"/>
  </svg>

</template>

<script>
  export default {
    name: 'Braces',
    props: {
      type: String,
      color: {
        type: String,
        default: '#777'
      }
    }
  }
</script>

<style scoped>
</style>
