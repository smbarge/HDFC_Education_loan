<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import { onMount } from 'svelte';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let userState = {
    hasApplication: true, 
    applicationStatus: 'pending', 
  };

 
  let dashboardData = {
    user: {
      name: 'Rahul Kumar',
      email: 'rahul.kumar@example.com',
      phone: '+91 98765 43210'
    },
    application: {
      id: 'MAMFDC2026001234',
      type: 'Education Loan Application',
      status: 'pending', 
      submittedDate: '15/01/2026',
      lastUpdated: '28/01/2026',
      progress: 65,
      nextAction: 'Upload Income Certificate',
      reviewDate: '05/02/2026',
      approvalDate: null,
      rejectionReason: null
    },
    loanDetails: {
      requestedAmount: '₹5,00,000',
      approvedAmount: '₹4,50,000',
      interestRate: '4.5% p.a.',
      loanTenure: '10 years',
      monthlyEMI: '₹4,674'
    },
    documents: {
      pending: 2,
      verified: 5,
      total: 7,
      pendingList: ['Income Certificate', 'Fee Structure']
    },
    recentActivities: [
      {
        id: 1,
        type: 'Document Uploaded',
        description: 'Aadhar card uploaded successfully',
        timestamp: '28/01/2026, 10:30 AM',
        icon: '📤',
        status: 'success'
      },
      {
        id: 2,
        type: 'Document Verified',
        description: 'Educational certificates verified',
        timestamp: '27/01/2026, 03:15 PM',
        icon: '✅',
        status: 'success'
      },
      {
        id: 3,
        type: 'Status Updated',
        description: 'Application status changed to Under Review',
        timestamp: '26/01/2026, 11:45 AM',
        icon: '🔄',
        status: 'info'
      },
      {
        id: 4,
        type: 'Application Submitted',
        description: 'Your application has been submitted for review',
        timestamp: '15/01/2026, 09:20 AM',
        icon: '📄',
        status: 'success'
      }
    ],
    support: {
      email: 'support@mamfdc.gov.in',
      emailResponse: 'Response within 24 hours',
      liveChat: 'Available now',
      phone: '1800-123-4567',
      phoneHours: 'Mon-Sat, 9 AM - 6 PM'
    }
  };

  onMount(() => {
    // Check if user has application
    checkUserStatus();
  });

  function checkUserStatus() {
    // This would normally fetch from backend
    // For demo, we'll use the state defined above
    userState.hasApplication = dashboardData.application.id ? true : false;
    userState.applicationStatus = dashboardData.application.status;
  }

  function startNewApplication() {
    goto(`/${locale}/application/start`);
  }

  function continueApplication() {
    goto(`/${locale}/application/continue`);
  }

  function uploadDocuments() {
    goto(`/${locale}/application/documents`);
  }

  function viewProfile() {
    goto(`/${locale}/profile`);
  }

  function getStatusColor(status) {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
      'approved': 'bg-green-100 text-green-800 border-green-300',
      'rejected': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  }

  function getStatusIcon(status) {
    const icons = {
      'pending': '⏳',
      'in-progress': '🔄',
      'approved': '✅',
      'rejected': '❌'
    };
    return icons[status] || '📄';
  }

  function getStatusText(status) {
    const statusMap = {
      'pending': t.dashboard.statusPending || 'Under Review',
      'in-progress': t.dashboard.statusInProgress || 'In Progress',
      'approved': t.dashboard.statusApproved || 'Approved',
      'rejected': t.dashboard.statusRejected || 'Rejected'
    };
    return statusMap[status] || status;
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
  <!-- Header Component -->
  <DashboardHeader {t} {locale} />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <!-- Welcome Section -->
    <section class="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-8">
      <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        {t.dashboard.welcome}
      </h2>
      <p class="text-gray-600">
        {t.dashboard.welcomeMessage}
      </p>
    </section>

    {#if !userState.hasApplication}
      <!-- ✅ NEW USER VIEW - No Application Yet -->
      <div class="max-w-4xl mx-auto">
        <!-- Welcome Card for New Users -->
        <section class="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 sm:p-12 mb-8 text-white text-center">
          <div class="text-6xl mb-6">🎓</div>
          <h3 class="text-3xl font-bold mb-4">{t.dashboard.welcomeNewUser || 'Welcome to MAMFDC!'}</h3>
          <p class="text-lg mb-8 opacity-90">
            {t.dashboard.newUserMessage || 'Start your education loan application journey today. Get financial support for your educational dreams.'}
          </p>
          <button
            on:click={startNewApplication}
            class="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🚀 {t.dashboard.startApplication || 'Start New Application'}
          </button>
        </section>

        <!-- Benefits Grid for New Users -->
        <div class="grid md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <div class="text-4xl mb-4">💰</div>
            <h4 class="text-lg font-bold text-gray-900 mb-2">
              {t.dashboard.benefitAmount || 'Up to ₹5 Lakhs'}
            </h4>
            <p class="text-sm text-gray-600">
              {t.dashboard.benefitAmountDesc || 'Get education loan up to ₹5,00,000'}
            </p>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <div class="text-4xl mb-4">📉</div>
            <h4 class="text-lg font-bold text-gray-900 mb-2">
              {t.dashboard.benefitRate || 'Low Interest'}
            </h4>
            <p class="text-sm text-gray-600">
              {t.dashboard.benefitRateDesc || 'Starting from 3% per annum with government subsidy'}
            </p>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <div class="text-4xl mb-4">⚡</div>
            <h4 class="text-lg font-bold text-gray-900 mb-2">
              {t.dashboard.benefitProcess || 'Quick Processing'}
            </h4>
            <p class="text-sm text-gray-600">
              {t.dashboard.benefitProcessDesc || 'Get approval within 15-20 working days'}
            </p>
          </div>
        </div>

        <!-- Help Section for New Users -->
        <section class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>❓</span>
            {t.dashboard.needHelp}
          </h3>
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="flex gap-3 p-4 bg-gray-50 rounded-lg">
              <span class="text-2xl">📞</span>
              <div>
                <h4 class="text-sm font-semibold text-gray-900 mb-1">{t.dashboard.callSupport}</h4>
                <p class="text-sm text-purple-600 font-semibold">{dashboardData.support.phone}</p>
              </div>
            </div>
            <div class="flex gap-3 p-4 bg-gray-50 rounded-lg">
              <span class="text-2xl">📧</span>
              <div>
                <h4 class="text-sm font-semibold text-gray-900 mb-1">{t.dashboard.emailSupport}</h4>
                <p class="text-sm text-purple-600 font-semibold">{dashboardData.support.email}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

    {:else}
      <!-- EXISTING USER VIEW - Has Application -->
      
      <!-- Application Status Banner -->
      <section class="bg-white rounded-xl shadow-lg border-2 {getStatusColor(dashboardData.application.status)} p-6 sm:p-8 mb-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex items-center gap-4">
            <span class="text-5xl">{getStatusIcon(dashboardData.application.status)}</span>
            <div>
              <h3 class="text-sm text-gray-600 mb-1">
                {t.dashboard.applicationStatus}
              </h3>
              <p class="text-3xl font-bold text-gray-900">{getStatusText(dashboardData.application.status)}</p>
            </div>
          </div>
          
          {#if dashboardData.application.status === 'pending' || dashboardData.application.status === 'in-progress'}
            <div class="text-left sm:text-right">
              <p class="text-sm text-gray-600 mb-1">{t.dashboard.overallProgress}</p>
              <p class="text-4xl font-bold text-gray-900">{dashboardData.application.progress}%</p>
            </div>
          {/if}
        </div>

        <!-- Status-specific messages -->
        {#if dashboardData.application.status === 'approved'}
          <div class="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p class="text-green-800 font-semibold mb-2">
              🎉 {t.dashboard.congratulations || 'Congratulations! Your loan has been approved.'}
            </p>
            <p class="text-sm text-green-700">
              {t.dashboard.approvedAmount || 'Approved Amount'}: <span class="font-bold">{dashboardData.loanDetails.approvedAmount}</span>
            </p>
          </div>
        {:else if dashboardData.application.status === 'rejected'}
          <div class="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p class="text-red-800 font-semibold mb-2">
              {t.dashboard.applicationRejected || 'We regret to inform you that your application has been rejected.'}
            </p>
            <p class="text-sm text-red-700">
              {t.dashboard.reason || 'Reason'}: {dashboardData.application.rejectionReason || 'Incomplete documentation'}
            </p>
            <button
              on:click={startNewApplication}
              class="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {t.dashboard.applyAgain || 'Apply Again'}
            </button>
          </div>
        {:else if dashboardData.application.status === 'pending'}
          <div class="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p class="text-yellow-800 text-sm">
              ⏰ {t.dashboard.underReview || 'Your application is under review. Expected review completion by'}: 
              <span class="font-bold">{dashboardData.application.reviewDate}</span>
            </p>
          </div>
        {/if}
      </section>

      <!-- Document Verification Alert -->
      {#if dashboardData.documents.pending > 0 && (dashboardData.application.status === 'pending' || dashboardData.application.status === 'in-progress')}
        <section class="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-start gap-4">
          <div class="text-4xl flex-shrink-0">⚠️</div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-yellow-900 mb-2">
              {t.dashboard.documentVerificationPending}
            </h3>
            <p class="text-yellow-800 text-sm mb-2">
              {t.dashboard.pendingDocuments || 'Pending documents'}: <span class="font-semibold">{dashboardData.documents.pendingList.join(', ')}</span>
            </p>
            <p class="text-yellow-800 text-sm font-semibold">
              🕒 {t.dashboard.uploadBy || 'Upload by'}: {dashboardData.application.reviewDate}
            </p>
          </div>
          <button
            on:click={uploadDocuments}
            class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap"
          >
            {t.dashboard.uploadDocuments} →
          </button>
        </section>
      {/if}

      <!-- Main Grid -->
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Application Details Card -->
          <section class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-6">
              {t.dashboard.yourApplication}
            </h3>
            
            <div class="flex items-center gap-4 mb-4">
              <span class="text-4xl">🎓</span>
              <div>
                <h4 class="text-lg font-semibold text-gray-900">{dashboardData.application.type}</h4>
                <p class="text-sm text-gray-600">
                  {t.dashboard.applicationId}: {dashboardData.application.id}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-3 mb-6">
              <span class="px-3 py-1.5 {getStatusColor(dashboardData.application.status)} rounded-lg text-sm font-semibold border-2">
                {getStatusIcon(dashboardData.application.status)} {getStatusText(dashboardData.application.status)}
              </span>
              <span class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                {t.dashboard.submitted || 'Submitted'}: {dashboardData.application.submittedDate}
              </span>
              <span class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                {t.dashboard.lastUpdated}: {dashboardData.application.lastUpdated}
              </span>
            </div>

            {#if dashboardData.application.status === 'in-progress'}
              <div class="mb-6">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{t.dashboard.progress}</span>
                  <span class="font-semibold text-gray-900">{dashboardData.application.progress}%</span>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-purple-600 rounded-full transition-all duration-300"
                    style="width: {dashboardData.application.progress}%"
                  ></div>
                </div>
              </div>

              <div class="flex gap-3 p-4 bg-blue-50 rounded-lg mb-6">
                <span class="text-xl flex-shrink-0">ℹ️</span>
                <div>
                  <p class="text-sm text-gray-600 mb-1">{t.dashboard.nextAction}:</p>
                  <p class="text-sm font-semibold text-blue-900">{dashboardData.application.nextAction}</p>
                </div>
              </div>
            {/if}

            <div class="flex gap-3">
              {#if dashboardData.application.status === 'in-progress'}
                <button
                  on:click={continueApplication}
                  class="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  {t.dashboard.continue} →
                </button>
              {/if}
              <button class="flex-1 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold border-2 border-gray-200 hover:border-purple-600 hover:text-purple-600 rounded-lg transition-all duration-200">
                👁️ {t.dashboard.viewDetails}
              </button>
            </div>
          </section>

          <!-- Quick Actions -->
          {#if dashboardData.application.status !== 'approved'}
            <section class="bg-white rounded-xl shadow-sm p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-6">
                {t.dashboard.quickActions}
              </h3>
              
              <div class="grid sm:grid-cols-2 gap-4">
                {#if dashboardData.application.status === 'in-progress'}
                  <button
                    on:click={continueApplication}
                    class="p-5 bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-600 rounded-xl transition-all duration-200 hover:-translate-y-1 text-left"
                  >
                    <span class="text-3xl block mb-3">▶️</span>
                    <h4 class="text-sm font-semibold text-gray-900 mb-1">
                      {t.dashboard.continueApplication}
                    </h4>
                    <p class="text-xs text-gray-600">
                      {t.dashboard.resumeIncomplete}
                    </p>
                  </button>
                {/if}

                {#if dashboardData.documents.pending > 0}
                  <button
                    on:click={uploadDocuments}
                    class="p-5 bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-600 rounded-xl transition-all duration-200 hover:-translate-y-1 text-left"
                  >
                    <span class="text-3xl block mb-3">📤</span>
                    <h4 class="text-sm font-semibold text-gray-900 mb-1">
                      {t.dashboard.uploadDocuments}
                    </h4>
                    <p class="text-xs text-gray-600">
                      {dashboardData.documents.pending} {t.dashboard.documentsRemaining || 'documents remaining'}
                    </p>
                  </button>
                {/if}

                <button
                  on:click={viewProfile}
                  class="p-5 bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-600 rounded-xl transition-all duration-200 hover:-translate-y-1 text-left"
                >
                  <span class="text-3xl block mb-3">👤</span>
                  <h4 class="text-sm font-semibold text-gray-900 mb-1">
                    {t.dashboard.viewProfile}
                  </h4>
                  <p class="text-xs text-gray-600">
                    {t.dashboard.manageAccount}
                  </p>
                </button>

                <button class="p-5 bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-600 rounded-xl transition-all duration-200 hover:-translate-y-1 text-left">
                  <span class="text-3xl block mb-3">📄</span>
                  <h4 class="text-sm font-semibold text-gray-900 mb-1">
                    {t.dashboard.trackStatus || 'Track Status'}
                  </h4>
                  <p class="text-xs text-gray-600">
                    {t.dashboard.checkApplicationStatus || 'Check your application status'}
                  </p>
                </button>
              </div>
            </section>
          {/if}

          <!-- Recent Activity -->
          <section class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-bold text-gray-900">
                {t.dashboard.recentActivity}
              </h3>
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                {t.dashboard.last7Days}
              </span>
            </div>

            <div class="space-y-6">
              {#each dashboardData.recentActivities as activity}
                <div class="flex gap-4 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                  <span class="text-2xl flex-shrink-0">{activity.icon}</span>
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-gray-900 mb-1">{activity.type}</h4>
                    <p class="text-sm text-gray-600 mb-2">{activity.description}</p>
                    <span class="text-xs text-gray-500">🕒 {activity.timestamp}</span>
                  </div>
                </div>
              {/each}
            </div>
          </section>

          <!-- Important Notice -->
          {#if dashboardData.application.status === 'pending' || dashboardData.application.status === 'in-progress'}
            <section class="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
              <h3 class="text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span>ℹ️</span>
                {t.dashboard.importantNotice}
              </h3>
              <p class="text-sm text-blue-800">
                {t.dashboard.noticeMessage}
              </p>
            </section>
          {/if}
        </div>

        <!-- Right Column -->
        <div class="space-y-8">
          
          <!-- Loan Summary -->
          <section class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="flex items-center gap-2 text-xl font-bold text-gray-900 mb-6">
              <span>📋</span>
              {t.dashboard.loanSummary}
            </h3>

            <div class="space-y-5 mb-5">
              <div class="flex items-center gap-3">
                <span class="text-2xl">💰</span>
                <div>
                  <p class="text-xs text-gray-600 mb-1">
                    {t.dashboard.requestedAmount}
                  </p>
                  <p class="text-base font-bold text-gray-900">{dashboardData.loanDetails.requestedAmount}</p>
                </div>
              </div>

              {#if dashboardData.application.status === 'approved'}
                <div class="flex items-center gap-3">
                  <span class="text-2xl">✅</span>
                  <div>
                    <p class="text-xs text-gray-600 mb-1">
                      {t.dashboard.approvedAmount}
                    </p>
                    <p class="text-base font-bold text-green-600">{dashboardData.loanDetails.approvedAmount}</p>
                  </div>
                </div>
              {/if}

              <div class="flex items-center gap-3">
                <span class="text-2xl">📊</span>
                <div>
                  <p class="text-xs text-gray-600 mb-1">
                    {t.dashboard.interestRate}
                  </p>
                  <p class="text-base font-bold text-gray-900">{dashboardData.loanDetails.interestRate}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span class="text-2xl">📅</span>
                <div>
                  <p class="text-xs text-gray-600 mb-1">
                    {t.dashboard.loanTenure}
                  </p>
                  <p class="text-base font-bold text-gray-900">{dashboardData.loanDetails.loanTenure}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span class="text-2xl">💳</span>
                <div>
                  <p class="text-xs text-gray-600 mb-1">
                    {t.dashboard.monthlyEMI}
                  </p>
                  <p class="text-base font-bold text-gray-900">{dashboardData.loanDetails.monthlyEMI}</p>
                </div>
              </div>
            </div>

            <div class="flex gap-2 p-4 bg-blue-50 rounded-lg">
              <span class="text-lg flex-shrink-0">ℹ️</span>
              <p class="text-xs text-blue-900 leading-relaxed">
                {t.dashboard.emiNote || 'EMI calculation is approximate. Final amount may vary based on approval and disbursement.'}
              </p>
            </div>
          </section>

          <!-- Document Status -->
          {#if dashboardData.application.status !== 'rejected'}
            <section class="bg-white rounded-xl shadow-sm p-6">
              <h3 class="flex items-center gap-2 text-xl font-bold text-gray-900 mb-6">
                <span>📂</span>
                {t.dashboard.documentStatus || 'Document Status'}
              </h3>

              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">{t.dashboard.verified || 'Verified'}</span>
                  <span class="text-2xl font-bold text-green-600">{dashboardData.documents.verified}/{dashboardData.documents.total}</span>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-green-500 rounded-full transition-all duration-300"
                    style="width: {(dashboardData.documents.verified / dashboardData.documents.total) * 100}%"
                  ></div>
                </div>
                
                {#if dashboardData.documents.pending > 0}
                  <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p class="text-xs text-yellow-800">
                      ⚠️ <span class="font-semibold">{dashboardData.documents.pending}</span> {t.dashboard.documentsRemaining}
                    </p>
                  </div>
                {/if}
              </div>
            </section>
          {/if}

          <!-- Help & Support -->
          <!-- <section class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="flex items-center gap-2 text-xl font-bold text-gray-900 mb-6">
              <span>❓</span>
              {t.dashboard.needHelp}
            </h3>

            <div class="space-y-4">
              <div class="flex gap-3 p-4 bg-gray-50 rounded-lg">
                <span class="text-2xl flex-shrink-0">📧</span>
                <div>
                  <h4 class="text-sm font-semibold text-gray-900 mb-1">
                    {t.dashboard.emailSupport}
                  </h4>
                  <p class="text-xs text-gray-600 mb-2">{dashboardData.support.emailResponse}</p>
                  <a href="mailto:{dashboardData.support.email}" class="text-sm text-purple-600 hover:text-purple-700 font-semibold hover:underline">
                    {dashboardData.support.email}
                  </a>
                </div>
              </div>

              <div class="flex gap-3 p-4 bg-gray-50 rounded-lg">
                <span class="text-2xl flex-shrink-0">💬</span>
                <div class="flex-1">
                  <h4 class="text-sm font-semibold text-gray-900 mb-1">
                    {t.dashboard.liveChat}
                  </h4>
                  <p class="text-xs text-gray-600 mb-3">{dashboardData.support.liveChat}</p>
                  <button class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors duration-200">
                    {t.dashboard.startChat}
                  </button>
                </div>
              </div>

              <div class="flex gap-3 p-4 bg-gray-50 rounded-lg">
                <span class="text-2xl flex-shrink-0">📞</span>
                <div>
                  <h4 class="text-sm font-semibold text-gray-900 mb-1">
                    {t.dashboard.callSupport}
                  </h4>
                  <p class="text-xs text-gray-600 mb-2">{dashboardData.support.phoneHours}</p>
                  <a href="tel:{dashboardData.support.phone}" class="text-sm text-purple-600 hover:text-purple-700 font-semibold hover:underline">
                    {dashboardData.support.phone}
                  </a>
                </div>
              </div>
            </div>

            <button class="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200">
              📖 {t.dashboard.viewFAQs}
            </button>
          </section> -->



        </div>
      </div>
    {/if}
  </div>
</div>