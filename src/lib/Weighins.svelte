<script lang="ts">
  import { getWeighings, octokitReady, uploadWeighingsToRepo, uploadWeighinImageToRepo} from './github';
  import type { Weighing } from './model';

  let imageBase64 = $state('');
  let day = $state(getDefaultDay());
  let weightInLbs = $state(0);
  let newShirt = $state(false)
  let newShorts = $state(false)
  let newPlateau = $state(false)
  let newScale = $state(false)

  function getDefaultDay(): number {
    const zeroDay = new Date("2025-04-30T16:00:00Z")
    const differenceInMilliseconds = (new Date()).getTime() - zeroDay.getTime()
    return Math.floor(differenceInMilliseconds / (86_400 * 1000))
  }

  function handleFileChange(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      imageBase64 = (reader.result as string).split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  function oneIfTrue(b: boolean): number {
    return b ? 1 : 0
  }

  async function send(weighins: {data: Weighing[]; sha: string;}) {
    const lastWeighing = weighins.data[weighins.data.length - 1]
    weighins.data.push({
      day,
      weightInLbs,
      scale: lastWeighing.scale + oneIfTrue(newScale),
      shirt: lastWeighing.shirt + oneIfTrue(newShirt),
      shorts: lastWeighing.shorts + oneIfTrue(newShorts),
      plateau: lastWeighing.plateau
    });
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
      <input type="number" min="0" bind:value={weightInLbs}/>
    </label>
    <label>
      Use new shirt
      <input type="checkbox" bind:checked={newShirt} />
    </label>
    <label>
      Use new shorts
      <input type="checkbox" bind:checked={newShorts} />
    </label>
    <label>
      New plateau
      <input type="checkbox" bind:checked={newPlateau} />
    </label>
    <label>
      Use new scale
      <input type="checkbox" bind:checked={newScale} />
    </label>
  </form>

  <button onclick={() => send(weighings)} disabled={uploadReady()}>
    Upload weighing
  </button>
{:catch error}
  {error}
{/await}
