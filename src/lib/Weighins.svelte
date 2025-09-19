<script lang="ts">
  import { getWeighings, octokitReady, uploadWeighingsToRepo, uploadWeighinImageToRepo} from './github';
  import type { Weighing } from './model';

  let imageBase64 = $state('');
  let day = $state(0);
  let weightInLbs = $state(0);

  function handleFileChange(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      imageBase64 = (reader.result as string).split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  async function send(weighins: {data: Weighing[]; sha: string;}) {
    weighins.data.push({day, weightInLbs});
    await uploadWeighinImageToRepo(weighins.data.length, imageBase64);
    await uploadWeighingsToRepo(weighins.data, weighins.sha);

    imageBase64 = '';
    day = 0;
    weightInLbs = 0;
  }

  function uploadReady(): boolean {
    return !octokitReady() || !imageBase64 || !day || !weightInLbs;
  }
</script>

<h1>List / upload weighins</h1>

{#await getWeighings()}
  Loading data...
{:then weighings}
  <ol>
    {#each weighings.data as weighing}
      <li>Day {weighing.day}: {weighing.weightInLbs}lbs</li>
    {/each}
  </ol>

  <form>
    <label>
      Nina image
      <input type="file" onchange={handleFileChange} />
    </label>
    <label>
      Day
      <input type="number" min="0" bind:value={day} />
    </label>
    <label>
      Weight in lbs
      <input type="number" min="0" bind:value={weightInLbs} />
    </label>
  </form>

  <button onclick={() => send(weighings)} disabled={uploadReady()}>
    Upload weighing
  </button>
{:catch error}
  {error}
{/await}
