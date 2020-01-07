<template>
  <a-modal
      :title="title"
      :visible="visible"
      @ok="handleOk"
      @cancel="handleCancel"
  >
    <p>{{ message }}</p>
    <a-input ref="edit" v-model="value" v-autofocus></a-input>
    <p v-if="check && !validate">this field is required</p>
  </a-modal>
</template>

<script>
  export default {
    name: 'Prompt',
    props: {
      title: String,
      message: String,
      default: String,
      required: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        visible: false,
        value: '',
        check: false,
        resolve: null,
        reject: null
      }
    },
    computed: {
      validate () {
        return !(this.required && this.value === '')
      }
    },
    methods: {
      show () {
        this.value = this.default || ''
        this.visible = true
        return new Promise((resolve, reject) => {
          this.resolve = resolve
          this.reject = reject
        })
      },
      handleOk () {
        this.check = true
        if (!this.validate) {
          return
        }
        this.visible = false
        this.resolve(this.value)
      },
      handleCancel () {
        this.visible = false
        this.reject(new Error('prompt canceled'))
      }
    }
  }
</script>

<style lang="less">

</style>
