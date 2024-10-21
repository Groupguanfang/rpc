<script setup lang="ts">
import { ref } from 'vue'
import { useWelcomeServer } from './apis/welcome-server'

const message = ref('Loading...')
const welcomeServer = useWelcomeServer()
welcomeServer.sayHello().then(msg => message.value = msg)
</script>

<template>
  <div>{{ message }}</div>
</template>
