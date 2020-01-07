<template>
  <div class="select-list" @click="$emit('input', -1)">
    <div class="select-list-item" :class="{selected: value===index}" v-for="(item, index) in items" @click.stop="handleClick($event, index)">
      <slot :row="{item, index}">
        {{ item }}
      </slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'SelectList',
    props: [ 'items', 'value' ],
    methods: {
      handleClick (e, index) {
        if (this.value === index) {
          if (e.detail === 2) {
            this.$emit('dblclick', index)
          } else return
        }
        this.$emit('input', index)
      }
    }
  }
</script>

<style lang="less">
.select-list {
  background: #FFF;
  height: 100%;

  .select-list-item {
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
</style>
