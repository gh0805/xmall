<template>
    <div>
        <!-- <h2>导航</h2> -->
        <m-header></m-header>
        <!-- 子路由的出口 -->
        <router-view></router-view>
    </div>
</template>

<script>
    import MHeader from '@/common/MHeader';
    export default {
        components: {
            MHeader
        }
    }
</script>

<style lang="scss" scoped>

</style>