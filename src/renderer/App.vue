<template>
  <a-locale-provider :locale="locale">
    <a-layout id="app">
      <Toolbar @open="handleOpen">
        <template v-if="url">
          <a-input placeholder="Basic usage" v-model="url" :disabled="connect===1 || connect===2" style="max-width: 400px"/>
          <template v-if="connect === 0">
            <a-button @click="handleOpen(url)">connect</a-button>
          </template>
          <template v-if="connect === 1">
            <a-button disabled>connecting ...</a-button>
          </template>
          <template v-if="connect === 2">
            <a-button type="danger" @click="handleClose">disconnect</a-button>
          </template>
        </template>
        <template v-else>Websocket client</template>
      </Toolbar>
      <split-pane :min-percent='10' :default-percent='70' split="horizontal" style="flex:auto">
        <template slot="paneL">
          <split-pane :min-percent='20' :default-percent='60' split="vertical">
            <template slot="paneL">
              <div class="message-list-wrapper">
                <div class="message-header">
                  <a-tooltip placement="bottomLeft">
                    <template slot="title">
                      clear
                    </template>
                    <a-icon class="btn" type="stop" @click="handleMessageListClear"/>
                  </a-tooltip>
                </div>
                <div class="message-list" ref="messageList" @click="handleMessageUnselect">
                  <slide-y-down-transition group>
                    <div class="message"
                         :class="{odd: index % 2, selected: selected === index}"
                         v-for="(msg, index) in messageList"
                         @click.stop="handleMessageSelect(index)"
                         :key="msg.time"
                    >
                      {{ msg.time }}

                      <Braces type="top" v-if="msg.type==='open'"></Braces>
                      <Braces type="middle" v-if="msg.type==='send' || msg.type==='recv'"></Braces>
                      <Braces type="bottom" v-if="msg.type==='close'"></Braces>

                      <a-tooltip :mouseEnterDelay="0.5" v-if="msg.type==='send'">
                        <template slot="title">
                          send
                        </template>
                        <a-icon type="swap-left" style="color:#0AF"/>
                      </a-tooltip>

                      <a-tooltip :mouseEnterDelay="0.5" v-if="msg.type==='recv'">
                        <template slot="title">
                          recv
                        </template>
                        <a-icon type="swap-right" style="color:#F83"/>
                      </a-tooltip>

                      {{ msg.data }}
                    </div>
                  </slide-y-down-transition>
                </div>
              </div>
            </template>
            <template slot="paneR">
              <div class="detail">
                <MessageDetail :message="selectedMessage"></MessageDetail>
              </div>
            </template>
          </split-pane>
        </template>
        <template slot="paneR">
          <div class="sender">
            <a-textarea placeholder="" v-model="message" :disabled="connect !== 2" @keyup.ctrl.enter="handleMessageSend"/>
            <span class="sender-btn" v-if="connect === 2">
              <a-button @click="handleMessageTemplate">template</a-button>
              <a-button @click="handleMessageClear">clear</a-button>
              <a-button type="primary" @click="handleMessageSend">send</a-button>
            </span>
          </div>
        </template>
      </split-pane>
      <Statusbar>
        status
      </Statusbar>
      <TemplateManager ref="templateManager"></TemplateManager>
    </a-layout>
  </a-locale-provider>
</template>

<script>
  // import locale from 'ant-design-vue/lib/locale-provider/zh_CN'
  import locale from 'ant-design-vue/lib/locale-provider/en_US'
  import * as moment from 'moment'
  import {sureThing} from '@/utils'
  import splitPane from 'vue-splitpane'
  import Toolbar from '@/components/Toolbar'
  import Statusbar from '@/components/Statusbar'
  import MessageDetail from '@/components/MessageDetail'
  import TemplateManager from '@/components/TemplateManager'
  import Braces from '@/components/Braces'
  import EventBus from '@/event-bus'

  export default {
    name: 'app',
    components: {
      Toolbar, Statusbar, MessageDetail, TemplateManager, Braces, splitPane
    },
    data () {
      return {
        locale: locale,
        connect: 0, // 0 idle， 1 connecting， 2 connected， 3 connect error
        url: null,
        message: '',
        messageList: [],
        selected: -1,
        tmFmt: 'YYYY-MM-DD HH:mm:ss.SS'
      }
    },
    computed: {
      selectedMessage () {
        return this.selected === -1 ? null : this.messageList[this.selected]
      }
    },
    watch: {
      messageList: function () {
        this.$nextTick(() => {
          const container = this.$refs.messageList
          container.scrollTop = container.scrollHeight + 120
        })
      }
    },
    methods: {
      handleOpen (url) {
        this.url = url
        this.$connect(url)
        this.connect = 1
      },
      handleClose () {
        this.$disconnect()
      },
      handleWsOpen (e) {
        this.connect = 2
        this.$message.success('connect ok')
        this.messageList.push({
          type: 'open',
          time: moment().format(this.tmFmt),
          data: `connect ${this.url}`
        })
      },
      handleWsClose (e) {
        if (this.connect === 2) {
          this.connect = 0
          this.$message.info('connection lost')

          this.messageList.push({
            type: 'close',
            time: moment().format(this.tmFmt),
            data: 'disconnected'
          })
        } else {
          this.connect = 0
          this.$message.error('connect failed')
        }
      },
      handleWsMessage (e) {
        this.messageList.push({
          type: 'recv',
          time: moment().format(this.tmFmt),
          data: e.data
        })
      },
      handleWsError (e) {
      },
      handleMessageSelect (index) {
        this.selected = index
      },
      handleMessageUnselect () {
        this.selected = -1
      },
      handleMessageClear () {
        this.message = ''
      },
      handleMessageSend () {
        this.$socket.send(this.message)
        this.messageList.push({
          type: 'send',
          time: moment().format(this.tmFmt),
          data: this.message
        })
      },
      async handleMessageTemplate () {
        const {ok, data} = await sureThing(this.$refs.templateManager.show())
        if (ok) {
          this.message = data.content
        }
      },
      handleMessageListClear () {
        this.messageList = []
      }
    },
    mounted () {
      EventBus.$on('onopen', this.handleWsOpen)
      EventBus.$on('onclose', this.handleWsClose)
      EventBus.$on('onmessage', this.handleWsMessage)
      EventBus.$on('onerror', this.handleWsError)
    },
    destroyed () {
      EventBus.$off('onopen', this.handleWsOpen)
      EventBus.$off('onclose', this.handleWsClose)
      EventBus.$off('onmessage', this.handleWsMessage)
      EventBus.$off('onerror', this.handleWsError)
    }
  }
</script>

<style lang="less">
#app {
  height: 100vh;
  background: #FFF;

  .multipane-resizer {
    margin: 0;
    left: 0;
    background: #eee;
    position: relative;
    &:before {
      display: block;
      content: "";
      width: 40px;
      height: 4px;
      position: absolute;
      top: 50%;
      left: 50%;
      border-top: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
      transform: translate(-50%, -50%);
    }
    &:hover {
      &:before {
        border-color: #999;
      }
    }
  }

  .message-list-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;

    .message-header {
      padding: 4px 6px;
      border-bottom: solid 1px #ccc;
      font-size: 13px;
      flex: none;

      .btn {
        color: rgba(0, 0, 0, 0.5);

        &:hover {
          color: rgba(0, 0, 0, 1);
        }
      }
    }

    .message-list {
      overflow: auto;
      padding-bottom: 100px;
      flex: auto;

      .message {
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
        padding: 0 2px;
        cursor: default;
        font-size: 13px;
        height: 24px;
        line-height: 24px;
        font-family: Consolas, "Courier New", Courier, FreeMono, monospace;

        * {
          vertical-align: middle;
        }

        &.odd {
          background: rgba(200, 200, 200, 0.2);
        }

        &:hover {
          background: rgba(100, 200, 255, 0.2);
        }

        &.selected {
          background: rgba(100, 200, 255, 0.5);
        }

        .sep {
          display: inline-block;
          width: 24px;
          height: 24px;
          background: #999999;
        }
      }
    }
  }



  .detail {
    height: 100%;

  }

  .sender {
    height: 100%;
    padding: 4px;
    position: relative;

    textarea {
      height: 100%;
      resize: none;
    }

    .sender-btn {
      position: absolute;
      right: 16px;
      bottom: 12px;
      padding: 12px;
    }
  }
}

.clearfix {
  content: '';
  clear: both;
}

.float-right{
  float: right;
}

.list {
  background: #FFF;

  .list-item {
    padding: 6px 12px;
    border: solid 1px transparent;

    &:hover {
      background: rgba(100, 200, 255, 0.3);
    }

    &.selected {
      background: rgba(100, 200, 255, 0.7);
      border: solid 1px rgba(100, 200, 255, 1);
    }
  }
}

.scroll::-webkit-scrollbar {
  width: 5px;
}

.scroll::-webkit-scrollbar-track {
  background: #ddd;
}

.scroll::-webkit-scrollbar-thumb {
  background: #AAA;
}
</style>
