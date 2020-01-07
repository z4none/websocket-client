<template>
  <div v-if="message">
    <a-tabs class="message-detail" v-if="message.type==='send' || message.type==='recv'">
      <a-tab-pane tab="data" key="1">
        {{ message.data }}
      </a-tab-pane>
      <a-tab-pane tab="json">
        <div class="json">
          <vue-json-pretty
              :data="json" v-if="json">
          </vue-json-pretty>
          <span v-else>
            <span class="error">
              Invalid json
            </span>
          </span>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
  import VueJsonPretty from 'vue-json-pretty'

  export default {
    name: 'MessageDetail',
    components: {
      VueJsonPretty
    },
    props: [
      'message'
    ],
    data () {
      return {}
    },
    computed: {
      json () {
        if (this.message) {
          try {
            return JSON.parse(this.message.data)
          } catch (e) {
            return null
          }
        }
      }
    }
  }
</script>

<style lang="less">
.message-detail {
  height: 100%;
  display: flex;
  flex-direction: column;

  .ant-tabs-bar {
    margin-bottom: 4px;
    flex: none;
  }

  .ant-tabs-content {
    flex: auto;

    .ant-tabs-tabpane {
      overflow: auto;
      padding: 4px;

      .error {
        color: #F00;
      }

      .vjs-tree {
        font-size: 13px;
      }
    }
  }

  .json {
    padding: 4px;
  }
}
</style>
