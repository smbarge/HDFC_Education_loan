<script>
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';

  // ✅ Get locale and translations reactively from URL
  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale] || i18n['en'];
</script>

<footer class="bg-gray-900 text-white py-5">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- Commented out detailed footer sections -->
    <!-- <div class="grid md:grid-cols-3 gap-8 mb-8">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-base sm:text-lg md:text-xl font-bold text-white">
              {t.header.title.split(' Minorities ')[0]} Minorities
              <br />
              {t.header.title.split(' Minorities ')[1]}
            </h1>
            <p class="text-sm text-gray-400">{t.header.subtitle}</p>
          </div>
        </div>
        <p class="text-gray-400 text-sm">{t.footer.about.description}</p>
      </div>

      <div>
        <h4 class="font-bold mb-4">{t.footer.quickLinks.title}</h4>
        <ul class="space-y-2 text-gray-400">
          {#if t.footer.quickLinks.links && Array.isArray(t.footer.quickLinks.links)}
            {#each t.footer.quickLinks.links as link}
              <li>
                <a href="/{locale}" class="hover:text-purple-400 transition">{link}</a>
              </li>
            {/each}
          {:else}
            <li><a href="/{locale}" class="hover:text-purple-400 transition">Apply for Loan</a></li>
            <li><a href="/{locale}" class="hover:text-purple-400 transition">Check Status</a></li>
            <li><a href="/{locale}" class="hover:text-purple-400 transition">FAQs</a></li>
          {/if}
        </ul>
      </div>

      <div>
        <h4 class="font-bold mb-4">{t.footer.contact.title}</h4>
        <ul class="space-y-3 text-gray-400 text-sm">
          <li class="flex items-start gap-2">
            <svg class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>{t.footer.contact.address}</span>
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <span>{t.footer.contact.phone}</span>
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <span>{t.footer.contact.email}</span>
          </li>
        </ul>
      </div>
    </div> -->

    <div class="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
      {t.footer.copyright}
    </div>
  </div>
</footer>

