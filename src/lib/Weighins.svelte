<script lang="ts">
  import { getWeighings, octokitReady, uploadWeighingsToRepo, uploadWeighinImageToRepo} from './github';
  import type { Weighing } from './model';

  let imageBase64 = $state('');
  let day = $state(getDefaultDay());
  let weightInLbs = $state(0);
  let newShirt = $state(false)
  let newShorts = $state(false)
  let newPlateau = $state(false)
  let newSandals = $state(false)
  let newScale = $state(false)

  function getDefaultDay(): number {
    const zeroDay = new Date("2025-04-30T16:00:00Z")
    const differenceInMilliseconds = (new Date()).getTime() - zeroDay.getTime()
    return Math.floor(differenceInMilliseconds / (86_400 * 1000))
  }

  const REQUIRED_WIDTH = 1930;
  const REQUIRED_HEIGHT = 2218;

  function handleFileChange(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      const img = new Image();
      img.onload = () => {
        // Dimension check
        if (img.width !== REQUIRED_WIDTH || img.height !== REQUIRED_HEIGHT) {
          alert(
            `Invalid image size. Expected ${REQUIRED_WIDTH}×${REQUIRED_HEIGHT}, ` +
            `got ${img.width}×${img.height}.`
          );
          reset();
          return;
        }

        // Transparency check
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          alert('Canvas not supported.');
          reset();
          return;
        }

        ctx.drawImage(img, 0, 0);

        const corners = [
          ctx.getImageData(0, 0, 1, 1).data, // top-left
          ctx.getImageData(img.width - 1, 0, 1, 1).data, // top-right
          ctx.getImageData(0, img.height - 1, 1, 1).data, // bottom-left
          ctx.getImageData(img.width - 1, img.height - 1, 1, 1).data // bottom-right
        ];

        const allCornersTransparent = corners.every(
          pixel => pixel[3] === 0 // alpha channel
        );

        if (!allCornersTransparent) {
          alert('Image corners must be transparent.');
          reset();
          return;
        }

        imageBase64 = (reader.result as string).split(',')[1];
      };

      img.src = dataUrl;
    }
    reader.readAsDataURL(file);

    function reset() {
      imageBase64 = '';
      event.target.value = '';
    }
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
      sandals: lastWeighing.sandals + oneIfTrue(newSandals),
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
      Use new sandals
      <input type="checkbox" bind:checked={newSandals} />
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
