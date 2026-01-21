<script>
  import { onMount } from 'svelte';
  import { currentLanguage } from '$lib/stores/language';
  import { translations } from '$lib/translations/index';
  import Header from '$lib/components/landingpage/Header.svelte';
  import Hero from '$lib/components/landingpage/Hero.svelte';
  // import SupportSection from '$lib/components/landingpage/BenefitsSection.svelte';
  import StatsSection from '$lib/components/landingpage/StatsSection.svelte';
  import EligibilitySection from '$lib/components/landingpage/EligibilitySection.svelte';
  import BenefitsSection from '$lib/components/landingpage/BenefitsSection.svelte';
  import DocumentsSection from '$lib/components/landingpage/DocumentsSection.svelte';
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


  $: t = translations[lang] || translations['en'];


  //Animation
  let qaVisibleItems = new Set();
  let qaObserver;
  
  onMount(() => {
    qaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.dataset.index;
            qaVisibleItems = new Set([...qaVisibleItems, index]);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const qaCards = document.querySelectorAll('.qa-animate-card');
    qaCards.forEach((card) => qaObserver.observe(card));

    const qaHeader = document.querySelector('.qa-animate-header');
    if (qaHeader) qaObserver.observe(qaHeader);

    return () => {
      if (qaObserver) qaObserver.disconnect();
      unsubscribe();
    };
  });


</script>

<svelte:head>
 
  <title>MAMFDC - Education Loan for Minority Communities</title>
  <meta name="description" content="Get education loans up to ₹5,00,000 with subsidized interest rates for students from minority communities in Maharashtra." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
  <Header />
  <Hero />
  <BenefitsSection />
  <!--<SupportSection />
   -->
  
  <EligibilitySection />
  <DocumentsSection />
  <StatsSection />

   
  <section class="py-16 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 
      class="qa-animate-header text-3xl font-bold text-center text-gray-900 mb-12 transition-all duration-700"
      class:opacity-0={!qaVisibleItems.has('qa-header')}
      class:translate-y-10={!qaVisibleItems.has('qa-header')}
      class:opacity-100={qaVisibleItems.has('qa-header')}
      class:translate-y-0={qaVisibleItems.has('qa-header')}
      data-index="qa-header"
    >
      {t.quickAnswers.title}
    </h2>
    
    <div class="grid md:grid-cols-3 gap-6">
      <div 
        class="qa-animate-card bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-700"
        class:opacity-0={!qaVisibleItems.has('qa-0')}
        class:scale-90={!qaVisibleItems.has('qa-0')}
        class:opacity-100={qaVisibleItems.has('qa-0')}
        class:scale-100={qaVisibleItems.has('qa-0')}
        data-index="qa-0"
      >
        <div class="flex items-start gap-3 mb-3">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-blue-500 font-bold">?</span>
          </div>
          <h3 class="font-bold text-gray-900">{t.quickAnswers.maxLoan.question}</h3>
        </div>
        <p class="text-gray-600 ml-11">{t.quickAnswers.maxLoan.answer}</p>
      </div>
      
      <div 
        class="qa-animate-card bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-700 delay-100"
        class:opacity-0={!qaVisibleItems.has('qa-1')}
        class:scale-90={!qaVisibleItems.has('qa-1')}
        class:opacity-100={qaVisibleItems.has('qa-1')}
        class:scale-100={qaVisibleItems.has('qa-1')}
        data-index="qa-1"
      >
        <div class="flex items-start gap-3 mb-3">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-blue-500 font-bold">?</span>
          </div>
          <h3 class="font-bold text-gray-900">{t.quickAnswers.approval.question}</h3>
        </div>
        <p class="text-gray-600 ml-11">{t.quickAnswers.approval.answer}</p>
      </div>
      
      <div 
        class="qa-animate-card bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-700 delay-200"
        class:opacity-0={!qaVisibleItems.has('qa-2')}
        class:scale-90={!qaVisibleItems.has('qa-2')}
        class:opacity-100={qaVisibleItems.has('qa-2')}
        class:scale-100={qaVisibleItems.has('qa-2')}
        data-index="qa-2"
      >
        <div class="flex items-start gap-3 mb-3">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-blue-500 font-bold">?</span>
          </div>
          <h3 class="font-bold text-gray-900">{t.quickAnswers.interest.question}</h3>
        </div>
        <p class="text-gray-600 ml-11">{t.quickAnswers.interest.answer}</p>
      </div>
    </div>
  </div>
</section>

  <Footer />
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }
</style>