<template>
  <a-modal title="save" v-model="visible">
    {{ message }}
    <template slot="footer">
      <a-button @click="handleYes" type="primary">yes</a-button>
      <a-button @click="handleNo">no</a-button>
      <a-button @click="handleCancel">cancel</a-button>
    </template>
  </a-modal>
</template>

<script>
  export default {
    name: 'SaveConfirm',
    data () {
      return {
        message: '',
        visible: false,
        resolve: null
      }
    },
    methods: {
      show (message) {
        this.visible = true
        this.message = message
        return new Promise((resolve, reject) => {
          this.resolve = resolve
        })
      },
      handleYes () {
        this.visible = false
        this.resolve('yes')
      },
      handleNo () {
        this.visible = false
        this.resolve('no')
      },
      handleCancel () {
        this.visible = false
        this.resolve('cancel')
      }
    }
  }
</script>

<style scoped>

</style>
