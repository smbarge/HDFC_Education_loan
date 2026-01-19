<script>
  import { onMount } from 'svelte';
  import { currentLanguage } from '$lib/stores/language';
  import { translations } from '$lib/translations/index';
  import Header from '$lib/components/landingpage/Header.svelte';
  import Hero from '$lib/components/landingpage/Hero.svelte';
//   import SupportSection from '$lib/components/SupportSection.svelte';
//   import StatsSection from '$lib/components/StatsSection.svelte';
//   import EligibilitySection from '$lib/components/EligibilitySection.svelte';
//   import BenefitsSection from '$lib/components/BenefitsSection.svelte';
//   import DocumentsSection from '$lib/components/DocumentsSection.svelte';
  import Footer from '$lib/components/landingpage/Footer.svelte';

  let lang = 'en';
  
  const unsubscribe = currentLanguage.subscribe(value => {
    lang = value;
  });

  onMount(() => {
    return () => {
      unsubscribe();
    };
  });

  // Add fallback to prevent errors
  $: t = translations[lang] || translations['en'];
</script>

<svelte:head>
  <title>MAMFDC - Education Loan for Minority Communities</title>
  <meta name="description" content="Get education loans up to ₹5,00,000 with subsidized interest rates for students from minority communities in Maharashtra." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
  <Header />
  <Hero />
  <!-- <SupportSection />
  <StatsSection /> -->
  
  <!-- Quick Answers Section -->
  <section class="py-16 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">{t.quickAnswers.title}</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-purple-600 font-bold">?</span>
            </div>
            <h3 class="font-bold text-gray-900">{t.quickAnswers.maxLoan.question}</h3>
          </div>
          <p class="text-gray-600 ml-11">{t.quickAnswers.maxLoan.answer}</p>
        </div>
        
        <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-purple-600 font-bold">?</span>
            </div>
            <h3 class="font-bold text-gray-900">{t.quickAnswers.approval.question}</h3>
          </div>
          <p class="text-gray-600 ml-11">{t.quickAnswers.approval.answer}</p>
        </div>
        
        <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-purple-600 font-bold">?</span>
            </div>
            <h3 class="font-bold text-gray-900">{t.quickAnswers.interest.question}</h3>
          </div>
          <p class="text-gray-600 ml-11">{t.quickAnswers.interest.answer}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- <EligibilitySection />
  <BenefitsSection />
  <DocumentsSection /> -->
  <Footer />
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }
</style>