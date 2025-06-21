<script lang="ts">
  import type { Component } from 'svelte';
  import Weighins from './lib/Weighins.svelte'
  import TokenForm from './lib/TokenForm.svelte'

  let hash = $state(getHash());

  function getHash() : string {
    return location.hash.slice(1) || '/';
  }

  // Listen to hash changes
  window.addEventListener('hashchange', () => {
    hash = getHash();
  });

  // Simple navigation helper
  function navigate(path: string) {
    location.hash = path;
  }

  // Route table
  const routes: {[hash: string]: Component} = {
    '/': Weighins,
    '/token': TokenForm,
  };

  // Pick the component based on the current hash
  const ComponentToDisplay = $derived(routes[hash] ?? routes['/']);

</script>

<main class="container-fluid">
  <nav>
    <ul>
      <li><strong>Nina admin</strong></li>
    </ul>
    <ul>
      <li><a href="#/" onclick={() => navigate('/')} class="contrast">Weighins</a></li>
      <li><a href="#/token" onclick={() => navigate('/token')} class="secondary">Token</a></li>
    </ul>
  </nav>

  <ComponentToDisplay />
</main>
