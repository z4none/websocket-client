<template>
  <a-modal
      class="connection-manager"
      title="connection manager"
      width="700px"
      :visible="visible"
      :bodyStyle="{padding: '0'}"
      @cancel="handleCancel"
  >
    <a-layout class="body">
      <a-layout-sider class="list" @click="handleUnselect()">
        <div v-for="(conn, index) in connections" :key="index" class="list-item" :class="{selected: index == selected}" @click.stop="handleSelect($event, index)">
          {{ conn.name }}
        </div>
      </a-layout-sider>
      <a-layout-content class="content">
        <a-form layout="vertical" v-if="selectedConnection">
          <a-form-item label="name">
            <a-input v-model="selectedConnection.name" ref="name"/>
          </a-form-item>
          <a-form-item label="url" >
            <a-input v-model="selectedConnection.url" placeholder="ws://host:port/url"/>
          </a-form-item>
        </a-form>
      </a-layout-content>
    </a-layout>

    <template slot="footer">
      <div class="footer">
        <div class="left">
          <a-button @click="handleCreate">create</a-button>
          <a-button @click="handleDelete" :disabled="selected===-1">delete</a-button>
          <a-button @click="handleSave" :disabled="!changed">save</a-button>
          <a-button @click="handleReset" :disabled="!changed">reset</a-button>
        </div>
        <div class="right">
          <a-button @click="handleCancel">cancel</a-button>
          <a-button type="primary" @click="handleOpen" :disabled="selected===-1">open</a-button>
        </div>
      </div>
    </template>
    <SaveConfirm ref="saveConfirm"></SaveConfirm>
  </a-modal>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'
  import _ from 'lodash'
  import SaveConfirm from '@/components/SaveConfirm'

  export default {
    name: 'ConnectionManage',
    components: {
      SaveConfirm
    },
    data () {
      return {
        visible: false,
        form: {},
        selected: -1,
        selectedConnection: null,
        originConnection: null
      }
    },
    computed: {
      changed () {
        return !_.isEqual(this.selectedConnection, this.originConnection)
      },
      ...mapState({
        connections: state => state.Connection.connections
      })
    },
    watch: {
      selected (val) {
        this.selectedConnection = (val === -1) ? null : { ...this.connections[this.selected] }
        this.originConnection = (val === -1) ? null : { ...this.selectedConnection }
      }
    },
    methods: {
      show () {
        this.visible = true
        this.selected = -1
      },
      handleOpen () {
        this.SET_CONNECTION({
          connection: {...this.selectedConnection},
          index: this.selected
        })
        this.visible = false
        this.$emit('open', this.selectedConnection)
      },
      handleCancel () {
        this.visible = false
      },
      handleCreate () {
        this.CREATE_CONNECTION({
          name: 'new connection',
          url: ''
        })
        this.selected = this.connections.length - 1
        this.$refs.name.focus()
      },
      handleDelete () {
        this.$confirm({
          title: 'sure?',
          content: `Are you sure you want to delete '${this.originConnection.name}' ?`,
          okText: 'delete',
          cancelText: 'cancel',
          onOk: function () {
            this.DELETE_CONNECTION({
              index: this.selected
            })
            this.selected = -1
          }.bind(this),
          onCancel () {}
        })
      },
      handleSave () {
        this.SET_CONNECTION({
          connection: {...this.selectedConnection},
          index: this.selected
        })
        this.originConnection = {...this.selectedConnection}
      },
      async handleSelect (e, index) {
        if (this.selected === index) {
          if (e.detail === 2) {
            this.handleOpen()
          } else return
        }
        if (this.changed) {
          const ret = await this.$refs.saveConfirm.show(`'${this.originConnection.name}' have unsaved changes, do you want to save?`)
          if (ret === 'yes') {
            this.SET_CONNECTION({
              connection: {...this.selectedConnection},
              index: this.selected
            })
            this.selected = index
            this.$message.success('saved')
          } else if (ret === 'no') {
            this.selected = index
          }
        } else {
          this.selected = index
        }
      },
      handleUnselect () {
        this.selected = -1
      },
      handleReset () {
        this.selectedConnection = {...this.originConnection}
      },
      ...mapMutations([
        'CREATE_CONNECTION',
        'SET_CONNECTION',
        'DELETE_CONNECTION'
      ])
    },
    mounted () {
    }
  }
</script>

<style lang="less">
  .connection-manager {
    .body {
      min-height: 270px;

      .content {
        margin: 20px;

        .ant-form-item {
          margin-bottom: 12px;
        }
      }
    }
    .footer {
      text-align: left;

     .left {
       display: inline-block;
     }

      .right{
        float: right;
      }

      .changed {
        color: #F00;
        margin-left: 4px;
      }
    }
  }
</style>
