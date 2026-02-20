<template>
  <div class="app" :class="{ 'app--sidebar-collapsed': sidebarCollapsed }">
    <!-- 背景装饰 -->
    <div class="app__bg">
      <div class="app__bg-orb app__bg-orb--1"></div>
      <div class="app__bg-orb app__bg-orb--2"></div>
      <div class="app__bg-orb app__bg-orb--3"></div>
    </div>
    
    <!-- 侧边栏 -->
    <Sidebar 
      :collapsed="sidebarCollapsed" 
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />
    
    <!-- 主内容区 -->
    <div class="app__main">
      <!-- 顶部导航 -->
      <Header title="控制台 Dashboard" />
      
      <!-- 内容区域 -->
      <main class="app__content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from './components/layout/Sidebar.vue';
import Header from './components/layout/Header.vue';

const sidebarCollapsed = ref(false);
</script>

<style lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;
@use '@/styles/global' as *;

.app {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  
  &__bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }
  
  &__bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.3;
    animation: float 20s ease-in-out infinite;
    
    &--1 {
      width: 400px;
      height: 400px;
      background: var(--color-primary);
      top: -100px;
      right: -100px;
      animation-delay: 0s;
    }
    
    &--2 {
      width: 300px;
      height: 300px;
      background: var(--color-secondary);
      bottom: -50px;
      left: -50px;
      animation-delay: -5s;
    }
    
    &--3 {
      width: 250px;
      height: 250px;
      background: var(--color-accent);
      top: 50%;
      left: 50%;
      animation-delay: -10s;
    }
  }
  
  &__main {
    position: relative;
    margin-left: var(--sidebar-width);
    transition: margin-left var(--transition-base);
  }
  
  &--sidebar-collapsed &__main {
    margin-left: var(--sidebar-collapsed-width);
  }
  
  &__content {
    padding: var(--spacing-xl);
    position: relative;
    z-index: 1;
  }
}

// 路由过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
