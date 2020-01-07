<template>
  <a-layout-header class="toolbar">
    <div class="brand">
      <slot></slot>
    </div>
    <div class="menu">
      <a-dropdown :trigger="['click']">
        <a href="#" class="menu-item">
          <a-icon type="ellipsis" class="han" />
        </a>
        <a-menu slot="overlay">
          <a-menu-item>
            <a href="#" @click="$refs.connectionManager.show()">connections</a>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>

    <ConnectionManager ref="connectionManager" @open="$emit('open', $event.url)"></ConnectionManager>
  </a-layout-header>
</template>

<script>
  import ConnectionManager from '@/components/ConnectionManager'

  export default {
    name: 'Toolbar',
    components: {
      ConnectionManager
    },
    methods: {
    }
  }
</script>

<style lang="less">
.toolbar {
  height: 48px;
  line-height: 48px;
  background: #FFF;
  border-top: solid 1px #CCC;
  border-bottom: solid 1px #CCC;
  padding: 0 10px;
  display: flex;

  .brand {
    flex: auto;
  }

  .menu {
    flex: none;

    .menu-item {
      font-size: 16px;
      margin-right: 10px;
      display: inline-block;
    }

    .han {
      transform: rotate(90deg);
    }
  }
}
</style>
