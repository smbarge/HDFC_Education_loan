<script>
  import { createEventDispatcher } from 'svelte';
  
  export let isOpen = false;
  export let verificationType = 'email'; 
  export let contactInfo = ''; 
  
  const dispatch = createEventDispatcher();
  
  let otpDigits = ['', '', '', '', '', ''];
  let isResending = false;
  let resendTimer = 0;
  let timerInterval;
  
  function startResendTimer() {
    resendTimer = 30;
    timerInterval = setInterval(() => {
      resendTimer--;
      if (resendTimer === 0) {
        clearInterval(timerInterval);
      }
    }, 1000);
  }
  
  $: if (isOpen) {
    startResendTimer();
    otpDigits = ['', '', '', '', '', ''];
  }
  
  function handleOtpInput(index, event) {
    const value = event.target.value;
    
    if (value.length > 1) {
      event.target.value = value.slice(-1);
      otpDigits[index] = value.slice(-1);
    } else {
      otpDigits[index] = value;
    }
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  }
  
  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  }
  
  function handlePaste(event) {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.split('');
    
    digits.forEach((digit, index) => {
      if (index < 6 && /^\d$/.test(digit)) {
        otpDigits[index] = digit;
      }
    });
    
    const lastIndex = Math.min(digits.length - 1, 5);
    const input = document.getElementById(`otp-${lastIndex}`);
    if (input) input.focus();
  }
  
  async function handleResend() {
    if (resendTimer > 0) return;
    
    isResending = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      startResendTimer();
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    } finally {
      isResending = false;
    }
  }
  
  function handleSubmit() {
    const otp = otpDigits.join('');
    if (otp.length === 6) {
      dispatch('verify', { otp, type: verificationType });
    }
  }
  
  function handleCancel() {
    if (timerInterval) clearInterval(timerInterval);
    dispatch('cancel');
  }
  
  function closeModal() {
    if (timerInterval) clearInterval(timerInterval);
    dispatch('close');
  }
</script>

{#if isOpen}

  <div 
    class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
    on:click={closeModal}
  ></div>
  
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div 
      class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative"
      on:click|stopPropagation
    >
      <button
        on:click={closeModal}
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Enter your verification code
        </h2>
      </div>
      
      <div class="flex justify-center mb-6">
        <svg class="w-32 h-32" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" fill="#E9D5FF"/>
          <rect x="60" y="70" width="80" height="100" rx="8" fill="white" stroke="#9333EA" stroke-width="2"/>
          <rect x="70" y="80" width="60" height="8" rx="2" fill="#9333EA"/>
          <rect x="70" y="95" width="60" height="8" rx="2" fill="#9333EA"/>
          <rect x="70" y="110" width="40" height="8" rx="2" fill="#9333EA"/>
          <circle cx="140" cy="50" r="15" fill="#F472B6"/>
          <path d="M140 45 L140 55 M135 50 L145 50" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <circle cx="70" cy="140" r="10" fill="#C084FC"/>
        </svg>
      </div>
      
      <div class="text-center mb-6">
        <p class="text-gray-700 font-medium mb-1">Verification code</p>
        <p class="text-sm text-gray-600 mb-3">
          We have sent the verification code to Your {verificationType === 'email' ? 'Email' : 'Mobile'}
        </p>
        <p class="text-cyan-600 font-semibold text-lg">
          {contactInfo}
        </p>
      </div>
      
      <div class="flex justify-center gap-2 sm:gap-3 mb-6">
        {#each otpDigits as digit, index}
          <input
            id="otp-{index}"
            type="text"
            maxlength="1"
            pattern="[0-9]"
            value={digit}
            on:input={(e) => handleOtpInput(index, e)}
            on:keydown={(e) => handleKeyDown(index, e)}
            on:paste={index === 0 ? handlePaste : null}
            class="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
          />
        {/each}
      </div>
      
      <div class="text-center mb-6">
        <p class="text-sm text-gray-600">
          If you don't receive a code?
          {#if resendTimer > 0}
            <span class="text-gray-500 font-medium">Resend in {resendTimer}s</span>
          {:else}
            <button
              on:click={handleResend}
              disabled={isResending}
              class="text-cyan-600 hover:text-cyan-700 font-medium underline disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend'}
            </button>
          {/if}
        </p>
      </div>
      
      <div class="flex gap-3">
        <button
          on:click={handleCancel}
          class="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          CANCEL
        </button>
        <button
          on:click={handleSubmit}
          disabled={otpDigits.join('').length !== 6}
          class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          SUBMIT
        </button>
      </div>
    </div>
  </div>
{/if}