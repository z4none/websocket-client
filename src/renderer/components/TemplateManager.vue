<template>
  <div>
    <a-modal
        class="template-manager"
        title="template manager"
        width="1000px"
        :visible="visible"
        :bodyStyle="{padding: '0'}"
        @cancel="handleCancel"
    >
      <a-layout class="body">
        <div class="col groups">
          <div class="col-header">
            Groups
            <div class="float-right">
              <a-icon type="plus" @click="handleGroupAdd"/>
            </div>
          </div>
          <SelectList class="col-content list scroll" :items="groups" v-model="selectedGroupIndex">
            <template v-slot:default="slotProps">
              <div class="clearfix">
                {{ slotProps.row.item.name }}
                <span class="float-right">
                  <a-dropdown :trigger="['click']">
                    <a-icon type="ellipsis" class="more-options"/>
                    <a-menu slot="overlay">
                      <a-menu-item @click="handleGroupEdit(slotProps.row.index)">
                        edit
                      </a-menu-item>
                      <a-menu-item @click="handleGroupDelete(slotProps.row.item)">
                        delete
                      </a-menu-item>
                    </a-menu>
                  </a-dropdown>
                </span>
              </div>
            </template>
          </SelectList>
        </div>
        <div class="col templates">
          <div class="col-header">
            Templates
            <div class="float-right">
              <a-icon type="plus" @click="handleTemplateAdd"/>
            </div>
          </div>
          <SelectList class="col-content list scroll" :items="selectedGroupTemplates" v-model="selectedTemplateIndex" @dblclick="handleTemplateDblclick">
            <template v-slot:default="slotProps">
              <div class="clearfix">
                {{ slotProps.row.item.name }}
                <span class="float-right">
                  <a-dropdown :trigger="['click']">
                    <a-icon type="ellipsis" class="more-options"/>
                    <a-menu slot="overlay">
                       <a-menu-item @click="handleTemplateDelete(slotProps.row.item)">
                        delete
                      </a-menu-item>
                    </a-menu>
                  </a-dropdown>
                </span>
              </div>
            </template>
          </SelectList>
        </div>
        <div class="content">
          <a-form layout="vertical" v-if="template">
            <a-form-item label="name">
              <a-input v-model="template.name" v-autofocus/>
            </a-form-item>
            <a-form-item label="code" >
              <a-textarea v-model="template.content" :autosize="{ minRows: 4, maxRows: 12 }" @keydown.tab.prevent="handleTab($event)"/>
            </a-form-item>
          </a-form>
        </div>
      </a-layout>

      <template slot="footer">
        <div class="footer clearfix">
          <div class="float-right">
            <a-button @click="handleTemplateSave" v-if="changed">save</a-button>
            <a-button @click="handleCancel">cancel</a-button>
            <a-button type="primary" @click="handleSelect" :disabled="!template">select</a-button>
          </div>
        </div>
      </template>
    </a-modal>


  </div>
</template>

<script>
  import uuidv4 from 'uuid/v4'
  import _ from 'lodash'
  import {sureThing} from '@/utils'
  import {mapState, mapMutations} from 'vuex'
  import SelectList from '@/components/SelectList'

  export default {
    name: 'TemplateManager',
    components: {
      SelectList
    },
    data () {
      return {
        visible: false,
        selectedGroupIndex: -1,
        selectedTemplateIndex: -1,
        template: null,
        originTemplate: null,
        resolve: null,
        reject: null
      }
    },
    computed: {
      selectedGroup () {
        return this.selectedGroupIndex === -1 ? null : this.groups[this.selectedGroupIndex]
      },
      selectedGroupTemplates () {
        return this.selectedGroupIndex === -1 ? [] : this.templates.filter(t => t.groupId === this.selectedGroup.id)
      },
      selectedTemplate () {
        return this.selectedTemplateIndex === -1 ? null : this.selectedGroupTemplates[this.selectedTemplateIndex]
      },
      changed () {
        return !_.isEqual(this.template, this.originTemplate)
      },
      ...mapState({
        groups: state => state.Template.groups,
        templates: state => state.Template.templates
      })
    },
    watch: {
      selectedGroupIndex () {
        this.selectedTemplateIndex = -1
      },
      selectedTemplate (val) {
        this.template = val ? {...val} : null
        this.originTemplate = val ? {...val} : null
      }
    },
    methods: {
      show () {
        this.selectedGroupIndex = -1
        this.visible = true
        return new Promise((resolve, reject) => {
          this.resolve = resolve
          this.reject = reject
        })
      },
      async handleGroupAdd () {
        const {ok, data} = await sureThing(this.$prompt({
          title: 'Group Name',
          message: 'please input group name'
        }))

        if (ok) {
          this.CREATE_GROUP({
            group: {
              id: uuidv4(),
              name: data
            }
          })
          this.selectedGroupIndex = this.groups.length - 1
        }
      },
      async handleGroupEdit (index) {
        const {ok, data} = await sureThing(this.$prompt({
          title: 'Group Name',
          message: 'please input group name',
          default: this.groups[index].name
        }))

        if (ok) {
          this.SET_GROUP({
            group: {
              ...this.groups[index],
              name: data
            },
            index
          })
          this.selectedGroupIndex = index
        }
      },
      handleGroupDelete (group) {
        const templateCount = this.templates.filter(t => t.groupId === group.id).length
        this.$confirm({
          title: '确认',
          content: templateCount ? `确定要删除 '${group.name}' 吗, 该组的 ${templateCount} 条模板将被删除` : `确定要删除 '${group.name}' 吗`,
          onOk: function () {
            this.DELETE_GROUP({group})
            this.selectedGroupIndex = -1
          }.bind(this)
        })
      },
      handleTemplateDblclick (index) {
        const template = this.selectedGroupTemplates[index]
        this.resolve(template)
        this.visible = false
      },
      async handleTemplateAdd () {
        const {ok, data} = await sureThing(this.$prompt({
          title: 'Template Name',
          message: 'please input template name'
        }))

        if (ok) {
          this.CREATE_TEMPLATE({
            template: {
              id: uuidv4(),
              groupId: this.selectedGroup.id,
              name: data,
              content: ''
            }
          })
          this.selectedTemplateIndex = this.selectedGroupTemplates.length - 1
        }
      },
      handleTemplateDelete (template) {
        this.$confirm({
          title: '确认',
          content: `确定要删除 '${template.name}' 吗`,
          onOk: function () {
            this.DELETE_TEMPLATE({template})
            this.selectedTemplateIndex = -1
          }.bind(this)
        })
      },
      handleTemplateSave () {
        this.SET_TEMPLATE({
          template: this.template
        })
        this.originTemplate = {...this.template}
        this.$message.success('保存模板成功')
      },
      handleTab (event) {
        if (event) {
          let startText = this.template.content.slice(0, event.target.selectionStart)
          let endText = this.template.content.slice(event.target.selectionStart)
          this.template.content = `${startText}\t${endText}`
          event.target.selectionEnd = event.target.selectionStart + 1
        }
      },
      handleSelect () {
        this.resolve(this.template)
        this.visible = false
      },
      handleCancel () {
        this.reject(new Error('user canceled'))
        this.visible = false
      },
      ...mapMutations([
        'CREATE_GROUP',
        'SET_GROUP',
        'DELETE_GROUP',
        'CREATE_TEMPLATE',
        'SET_TEMPLATE',
        'DELETE_TEMPLATE'
      ])
    }
  }
</script>

<style lang="less">
.template-manager {
  .body {
    min-height: 400px;
    display: flex;
    flex-direction: row;

    .col {
      width: 200px;
      flex: none;
      display: flex;
      flex-direction: column;

      .col-header {
        padding: 4px 6px;
        border-bottom: solid 1px #ccc;
        font-size: 13px;
        flex: none;
      }

      .col-content{
        flex: auto;
        max-height: 450px;
        overflow: auto;
      }
    }

    .groups {
      background: #FFF;
      border-right: solid 1px #CCC;
    }

    .templates {
      background: #FFF;
      border-right: solid 1px #CCC;
    }

    .content {
      flex: auto;
      padding: 20px;
    }

    .more-options {
      transform: rotate(90deg);
      color: #777;

      &:hover {
        color: #00AAFF;
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
