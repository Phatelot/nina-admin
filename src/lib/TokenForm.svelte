<script lang="ts">
    import { getGithubToken, updateGithubToken } from "./github";

    let token = $state(getGithubToken() || '');
</script>

<h1>Set up Github token</h1>

<form>
  <label>
    Token
    <input type=password bind:value={token} onchange={() => updateGithubToken(token)}/>
  </label>
</form>
