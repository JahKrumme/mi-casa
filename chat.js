(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // Inject widget HTML into the page
  // ─────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <button class="chat-toggle" id="chat-toggle"
            aria-label="Open Casa Companion" aria-expanded="false" aria-controls="chat-window">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      Need Help?
    </button>

    <div class="chat-window" id="chat-window" role="dialog"
         aria-label="Casa Companion" aria-modal="false" hidden>
      <div class="chat-header">
        <div>
          <div class="chat-header-title">Casa Companion</div>
          <div class="chat-header-sub">Here to help with any questions</div>
        </div>
        <div class="chat-header-actions">
          <button class="chat-expand" id="chat-expand" aria-label="Expand to full screen">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
          <button class="chat-close" id="chat-close" aria-label="Close Casa Companion">&#x2715;</button>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages"
           role="log" aria-live="polite" aria-atomic="false" aria-label="Chat messages"></div>
      <form class="chat-form" id="chat-form" autocomplete="off" novalidate>
        <label for="chat-input" class="sr-only">Type your question</label>
        <input type="text" id="chat-input" class="chat-input"
               placeholder="Type a question…" autocomplete="off" maxlength="300" />
        <button type="submit" class="chat-send" aria-label="Send message">Send</button>
      </form>
    </div>
  `);

  // ─────────────────────────────────────────────
  // Element references
  // ─────────────────────────────────────────────
  const toggleBtn = document.getElementById('chat-toggle');
  const chatWin   = document.getElementById('chat-window');
  const closeBtn  = document.getElementById('chat-close');
  const expandBtn = document.getElementById('chat-expand');
  const msgList   = document.getElementById('chat-messages');
  const form      = document.getElementById('chat-form');
  const input     = document.getElementById('chat-input');

  let isOpen       = false;
  let greeted      = false;
  let isFullscreen = false;
  const AUTO_KEY   = 'casaCompanionDismissed';
  const HELPED_KEY = 'casaCompanionHelped';

  const EXPAND_ICON   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
  const COLLAPSE_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>`;

  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    chatWin.classList.toggle('fullscreen', isFullscreen);
    expandBtn.innerHTML = isFullscreen ? COLLAPSE_ICON : EXPAND_ICON;
    expandBtn.setAttribute('aria-label', isFullscreen ? 'Exit full screen' : 'Expand to full screen');
    msgList.scrollTop = msgList.scrollHeight;
  }

  // ─────────────────────────────────────────────
  // UI helpers
  // ─────────────────────────────────────────────
  function addMessage(html, who) {
    const el = document.createElement('div');
    el.className = 'chat-msg ' + who;
    el.innerHTML = html;
    msgList.appendChild(el);
    msgList.scrollTop = msgList.scrollHeight;
  }

  function addQuickReplies(options) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-quick-replies';
    options.forEach(function (label) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-quick-btn';
      btn.textContent = label;
      btn.addEventListener('click', function () {
        wrap.remove();
        addMessage(label, 'user');
        respond(label);
      });
      wrap.appendChild(btn);
    });
    msgList.appendChild(wrap);
    msgList.scrollTop = msgList.scrollHeight;
  }

  var MAIN_QUICK = [
    'What is Home Plus?',
    'Payment Options',
    'Our Locations',
    'Meet the Team',
    'See the Gallery',
    'Schedule a Visit',
    'Careers'
  ];

  function openChat() {
    isOpen = true;
    chatWin.hidden = false;
    toggleBtn.setAttribute('aria-expanded', 'true');
    if (!greeted) {
      greeted = true;
      setTimeout(function () {
        var msg = sessionStorage.getItem(HELPED_KEY)
          ? "How can I help?"
          : "Hi, I'm Casa Companion. I'm here to help you learn more about Mi Casa Care Homes. We know that finding the right care for a loved one is an important decision, and we're glad you're here. How can we help you today?";
        addMessage(msg, 'assistant');
        addQuickReplies(MAIN_QUICK);
      }, 180);
    }
    setTimeout(function () { input.focus(); }, 60);
  }

  function closeChat() {
    isOpen = false;
    chatWin.hidden = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.focus();
    sessionStorage.setItem(AUTO_KEY, '1');
  }

  // ─────────────────────────────────────────────
  // Navigation helper
  // Handles both same-page scroll and cross-page navigation.
  // url can be 'page.html' or 'page.html#section-id'
  // ─────────────────────────────────────────────
  var NAV_KEY = 'casaCompanionShouldOpen';

  function navigateTo(url) {
    var hashIdx = url.indexOf('#');
    var page    = hashIdx >= 0 ? url.substring(0, hashIdx) : url;
    var hash    = hashIdx >= 0 ? url.substring(hashIdx + 1) : '';

    var pathname = window.location.pathname;
    var onTarget = pathname.endsWith('/' + page) ||
                   pathname.endsWith('\\' + page) ||
                   (page === 'index.html' && (pathname.endsWith('/') || pathname.endsWith('/index.html')));

    setTimeout(function () {
      // Collapse fullscreen so the widget doesn't block page content
      if (isFullscreen) toggleFullscreen();

      // On mobile, dismiss the keyboard without closing the widget
      if (window.innerWidth <= 640) input.blur();

      if (onTarget) {
        // Same-page scroll: widget stays open, no state change needed
        if (hash) {
          var el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        // Cross-page: signal the incoming page to re-open the widget
        sessionStorage.setItem(NAV_KEY, '1');
        window.location.href = url;
      }
    }, 1200);
  }

  // ─────────────────────────────────────────────
  // Response engine
  //
  // !! AI INTEGRATION POINT !!
  // Replace respond() with a fetch() to your AI backend
  // (e.g. Claude API, OpenAI) and render replies with addMessage().
  // The rule-based logic below is placeholder content only.
  // ─────────────────────────────────────────────

  // Primary rules: fast regex matching for direct/common queries
  var rules = [
    // ── Emergency ────────────────────────────────────────────────
    {
      test: /emergency|call.?911|urgent|dying|choking|severe.?pain/i,
      reply: "If someone needs immediate medical attention, please <strong>call 911 right away</strong>. For general questions about Mi Casa Care Homes, we're here to help."
    },
    // ── Greeting ─────────────────────────────────────────────────
    {
      test: /\b(hi+|hello|hey|howdy|good (morning|afternoon|evening))\b/i,
      reply: "Hello, and welcome. We're glad you reached out. Please feel free to ask us anything about Mi Casa Care Homes -- there are no wrong questions.",
      quick: ['What is Home Plus?', 'Our Locations', 'Meet the Team', 'Schedule a Visit']
    },
    // ── Health and safety (must come before licensing rule) ───────
    {
      test: /is it safe|how safe|safety (record|rating|protocol|measure|standard|practice)|health (and )?safety|safe (for|environment|place|home)|do you (keep|make) (it|residents|them) safe/i,
      reply: "The safety of our residents is something we take very seriously. Mi Casa is licensed and regulated by KDADS, which conducts regular inspections and enforces care standards. Our team follows established health, safety, and emergency protocols, and we communicate openly with families whenever there are health concerns. We're happy to walk through specifics during a visit.",
      quick: ['Is Mi Casa licensed?', 'Schedule a Visit']
    },
    // ── FAQ ──────────────────────────────────────────────────────
    {
      test: /\bfaq\b|frequent(ly asked)?|common (question|q&a)|question(s)? (you|people|families|we) (get|ask)/i,
      reply: "Our FAQ covers the questions we hear most, from care and services to pricing, visitation, safety, and more. Taking you there now.",
      nav: 'faq.html',
      quick: ['What is Home Plus?', 'Payment Options', 'Schedule a Visit']
    },
    // ── Visitation policy (must come before scheduling rule) ──────
    {
      test: /visitation (polic|hour|rule|guideline)|visiting (hour|polic|rule)|when can (i|we|family|visitors?) (come|visit)|can (i|we|family|visitors?) (come|visit)|open to visitors|(visit|see) (my|their|a|the) loved one|family (come|visit|stop by)|allow(ed)? (to )?visit|are visitors welcome/i,
      reply: "Families are always welcome. We believe that staying connected to loved ones is essential to wellbeing, and we encourage regular visits. If you have specific questions about visiting hours or current guidelines, please reach out and we'll be happy to walk you through our current policy.",
      quick: ['Schedule a Visit', 'Who is welcome to visit?']
    },
    // ── Who can come for a tour ───────────────────────────────────
    {
      test: /who (can|should) visit|who is welcome (to visit)?|bring (my|a)|can (i|we) bring/i,
      reply: "Everyone is welcome to visit. Adult children and other family members can come on their own or bring their loved one along. Prospective residents are always welcome to see the home for themselves. We also welcome social workers, discharge planners, and physicians who want to learn more about how we work. <a href='schedule.html'>Request a visit here</a>."
    },
    // ── What to expect during a tour ─────────────────────────────
    {
      test: /what happens (during|at) (a |the )?visit|what to expect (during|at|from) (a |the )?visit|what (is|does) (a |the )?tour (like|involve|include)|what should (i|we) expect/i,
      reply: "When you come to visit, we'll take you through the home, show you the common areas and living spaces, and take as much time as you need to answer your questions. There is no pressure and no obligation. We want you to feel comfortable and confident in whatever decision you make."
    },
    // ── Schedule a tour ──────────────────────────────────────────
    {
      test: /\bschedul|\btour\b|appointment|come see|come in|see the home|book (a )?(visit|tour|time)/i,
      reply: "We welcome families to come see the home in person. Just fill out the short form and a member of our team will reach out within one business day to confirm a time that works for you. Taking you to the Schedule a Visit page now.",
      nav: 'schedule.html',
      quick: ['What happens during a visit?', 'Who is welcome to visit?']
    },
    // ── Home Plus ────────────────────────────────────────────────
    {
      test: /home.?plus|what (is|are) (a |the )?home.?plus/i,
      reply: "A Home Plus facility is a state-licensed care setting that serves a small number of residents in a real family home rather than a large building. Residents receive personal care and nursing support in a calm, familiar environment. Mi Casa is a licensed Home Plus facility in Kansas. Taking you to our Home Plus page now.",
      nav: 'home-plus.html',
      quick: ['Is this right for my loved one?', 'Schedule a Visit', 'Is Mi Casa licensed?']
    },
    // ── Who is it right for ──────────────────────────────────────
    {
      test: /who is it (right )?for|who do you (serve|care for)|right for|good fit|is (it|mi casa|this) (right|a good fit|appropriate|suitable)|loved one|parent|mom|dad|family member/i,
      reply: "Mi Casa is a good fit for adults who need regular help with daily tasks like bathing, dressing, or getting around, and who may also need medication support or nursing oversight, but who do not require a hospital or full nursing facility. Many families find that this kind of setting feels more peaceful and personal than a larger care facility. If you're not sure whether it's the right fit, we'd be glad to talk it through with you. <a href='schedule.html'>Schedule a visit</a> and we'll answer your questions honestly.",
      quick: ['Schedule a Visit', 'What is Home Plus?']
    },
    // ── Licensing / KDADS ────────────────────────────────────────
    {
      test: /licens|regulat|kdads|certified|inspect|oversight|is (mi casa|it) (licensed|regulated|certified|inspected)/i,
      reply: "Mi Casa Care Homes is fully licensed and regulated by the Kansas Department for Aging and Disability Services, known as KDADS. They set the standards for care quality and safety, and they conduct regular inspections of our home. You can learn more about those standards at <a href='https://kdads.ks.gov' target='_blank' rel='noopener'>kdads.ks.gov</a>."
    },
    // ── Services / personal care / ADLs ─────────────────────────
    {
      test: /service|care (do you|you provide)|what do you (do|offer|provide)|personal care|what.?care|bathing|dressing|grooming|activities of daily|ADL/i,
      reply: "We provide personal care (bathing, dressing, grooming, and mobility assistance), medication management and nursing oversight, health monitoring, and coordination with your loved one's doctors. We do all of this in a real home setting where residents are known by name.",
      quick: ['Schedule a Visit', 'What is Home Plus?']
    },
    // ── Medication management ────────────────────────────────────
    {
      test: /medic(ation|ine)|prescri(ption|bed)|pill|dose|dosage|manage (meds|medication|medicine)|medication (management|help|support|administration)/i,
      reply: "Our team includes certified medication aides (CMAs) and licensed nursing staff who manage and administer medications for residents. We track schedules, coordinate with prescribing physicians, and communicate with families about any changes. Medication safety is a core part of the care we provide."
    },
    // ── Activities / typical day ─────────────────────────────────
    {
      test: /activit(y|ies)|program(ming|s)?|entertainment|daily (life|routine|schedule|activities)|what do (you|residents|they|people) do( all day| there| here| during the day)?|typical day|day (like|look like)|what.?s (a|it like|the) (typical|normal|average|usual|regular) day|music|games?|craft|outdoor|keep residents (busy|engaged|active)/i,
      reply: "We engage residents in daily activities that bring joy, connection, and purpose: conversation, music, games, seasonal crafts, and time outdoors when weather allows. We pay attention to what each resident enjoys and build their days around what matters to them personally.",
      quick: ['Schedule a Visit', 'What services do you provide?']
    },
    // ── Meals / dining ───────────────────────────────────────────
    {
      test: /\bmeal|food\b|what do (you|residents|they|people) eat|dining|cook|home.?cook|breakfast|lunch|dinner\b|nutrition|dietary|menu/i,
      reply: "Residents enjoy home-cooked meals prepared fresh in our kitchen. We work to accommodate dietary preferences and nutritional needs. Mealtimes are shared together, not delivered to a room, which helps daily life feel normal and connected.",
      quick: ['What services do you provide?', 'Schedule a Visit']
    },
    // ── Memory care / dementia ───────────────────────────────────
    {
      test: /memory (loss|care|impairment|issues?)|dementia|alzheimer|cognitive (decline|impairment)?|confusion|forgetful|memory.?related/i,
      reply: "We're experienced in caring for residents with a range of needs, including those experiencing memory-related challenges. Our team adapts care to meet each resident where they are. Our small, intimate setting tends to be calming and familiar, which can be especially meaningful for residents with memory loss.",
      quick: ['Schedule a Visit', 'What services do you provide?']
    },
    // ── Family communication / staying in touch ──────────────────
    {
      test: /how do (i|we|families?) (stay in touch|communicate|keep in touch|reach out|check in|hear|get updates?|find out how)|updates? (on|about) (my|our|a) (loved one|mom|dad|parent|resident|them)|contact (staff|the home|the team)|communicate with (the home|staff|team|caregivers?)|call (the home|staff|team)|how (do|will|can) (you|the team|staff) communicate|keep (me|us|families?) (informed|updated|in the loop)/i,
      reply: "We keep families informed and welcome your calls and visits. You can reach our staff at (316) 777-6655 anytime, and we proactively communicate with families whenever there are health changes or important updates. We also publish <a href='newsletter.html'>The Casa Chronicles</a>, our newsletter, with updates and highlights from both homes. We believe families are partners in care, not visitors.",
      quick: ['Schedule a Visit', 'Meet the Team']
    },
    // ── Home feel / atmosphere ───────────────────────────────────
    {
      test: /what.?s it like (living|being|there|here)|what does it feel like|home.like|like a (home|house|family)|atmosphere|feel (like home|warm|welcoming|comfortable|friendly)|environment (like|feel)|peaceful|cozy|comfortable setting/i,
      reply: "Mi Casa really does feel like a home, not a facility. Residents share meals together, relax in common living spaces, and live in a real neighborhood setting. The small size means staff and residents genuinely get to know each other over time. Many families tell us it's the warmth of the place that surprised them most when they first visited.",
      quick: ['Schedule a Visit', 'See the Gallery']
    },
    // ── Admission / getting started ──────────────────────────────
    {
      test: /how do (i|we) (get started|start|begin|enroll|admit|apply|sign up)|admission (process|requirements?|criteria|paperwork)|how (does|do) (admission|enrollment|intake|the process|getting in|moving in) work|what (do i|do we|is the) (need|process|paperwork|step)|intake process|getting (a|my|our) loved one (admitted|in|started|enrolled)/i,
      reply: "The process starts with a visit and a conversation. We'll learn about your loved one's needs, answer your questions, and talk through whether Mi Casa is the right fit. If everyone agrees it is, our team will walk you through the paperwork, care planning, and move-in details from there. <a href='schedule.html'>Schedule a visit</a> to get started.",
      quick: ['Schedule a Visit', 'How soon can my loved one move in?']
    },
    // ── Availability / waitlist ──────────────────────────────────
    {
      test: /availability|available (room|bed|space|spot)|do you have (room|space|availability|openings?|a spot|a bed)|(any |a )?(open|available) (bed|room|spot|space|opening)|waiting list|wait list|is there a (wait|waitlist)|how soon|when can (my|our|a) (loved one|mom|dad|parent|family|resident|they) (move|start|come|come in|begin)|move.?in (date|timeline|timing)|when (is|are) (you|mi casa) available/i,
      reply: "Move-in timelines depend on availability and your loved one's individual care needs. We encourage you to schedule a visit so we can learn more about your situation and give you an honest timeline. We'll never rush that process.",
      quick: ['Schedule a Visit', 'Do you help with the moving process?']
    },
    // ── Moving in / transition ───────────────────────────────────
    {
      test: /help (with the )?mov(ing|e)|transition (into|to( a)?|support)|mov(ing|e) (help|process|support|assistance)|how do (we|i|families) (move|transition)|what do (i|we) (bring|pack|need to bring)/i,
      reply: "We're happy to help make the transition as smooth as possible. Our team can walk families through what to bring, how to set up your loved one's space, and how to prepare them for the change. Moving a loved one into a care home is a meaningful moment, and we treat it that way.",
      quick: ['Schedule a Visit', 'Can residents personalize their space?']
    },
    // ── Staff-to-resident ratio ───────────────────────────────────
    {
      test: /ratio|staff.?to.?resident|caregiver.?to.?resident|how many (staff|caregivers?|nurses?) (per|for each|to each)/i,
      reply: "Because we keep our setting small and intimate, our staff-to-resident ratio is significantly better than what you'd find in a traditional nursing home or large assisted living facility. We're happy to talk through specifics when you come for a visit.",
      quick: ['Schedule a Visit', 'What experience does your staff have?']
    },
    // ── Staff qualifications / experience ────────────────────────
    {
      test: /staff.?(experience|background|qualif|credential|train|certif)|how (experienced|qualified|trained) (are|is) (your|the) (staff|team|caregivers?)/i,
      reply: "Our team includes certified nursing assistants (CNAs), certified medication aides (CMAs), and licensed nursing professionals, each with experience in residential care settings. We look for people who are not just qualified, but genuinely caring. Many of our caregivers have worked in elder care for years.",
      quick: ['Meet the Team', 'Schedule a Visit']
    },
    // ── Infection control ────────────────────────────────────────
    {
      test: /\b(covid|coronavirus|virus\b|bacteria|infection control|sanitiz|hygiene|illness prevention|flu\b|sick\b)/i,
      reply: "We take infection control seriously. Our home is cleaned and sanitized regularly and our team follows established protocols to protect residents from illness, including seasonal viruses, bacteria, and Covid-19. We communicate openly with families whenever there are health concerns in the home.",
      quick: ['Schedule a Visit', 'What is your visitation policy?']
    },
    // ── Hospitalization / falls ───────────────────────────────────
    {
      test: /\b(hospital|hospitalization|fall\b|fell\b|fallen)\b|resident (falls?|gets? hurt|has an accident|goes? to (the )?hospital)|what (happens?|do you do) (if|when) (a resident|someone|they) (fall|falls|gets? hurt|has to go)/i,
      reply: "If a resident experiences a fall or needs emergency medical care, we respond immediately, calling 911 when necessary and contacting the family as soon as possible. After a hospitalization, we work closely with the family and any medical providers to support a smooth return home.",
      quick: ['Schedule a Visit', 'Do you allow doctor visits?']
    },
    // ── Doctor visits / house calls ───────────────────────────────
    {
      test: /doctor (visit|come|at (the )?home|to (the )?home)|physician (at|visit|come)|house call|in.?home (doctor|physician|medical)|can (a )?doctor (come|visit)|medical (provider|professional) (visit|come to)/i,
      reply: "Yes. We welcome healthcare providers to visit residents at our home. Having a doctor or nurse practitioner come to the resident is often easier and less disruptive than transporting them, and we're glad to facilitate and coordinate those visits.",
      quick: ['Schedule a Visit', 'What happens if a resident has to go to the hospital?']
    },
    // ── Weather emergencies ───────────────────────────────────────
    {
      test: /tornado|severe weather|storm (plan|preparedness|emergency)|weather (emergency|plan|preparedness)|natural disaster|emergency (plan|preparedness)|shelter (plan|in.?place)/i,
      reply: "The safety of our residents is our top priority. We have a documented severe weather and tornado preparedness plan in place. During a warning, our team moves residents to designated safe areas of the home and follows established emergency protocols until the all-clear is given.",
      quick: ['Schedule a Visit', 'Is Mi Casa licensed?']
    },
    // ── Room personalization ──────────────────────────────────────
    {
      test: /personaliz|decor(ate)?|bring (from home|their own|personal|stuff|belongings|furniture|picture|photo)|(their|my) own (stuff|things|furniture|belongings|decor)|make it (their|my) own|customize (the|their|my) (room|space)|room.?(decor|look)/i,
      reply: "Absolutely. We encourage residents to bring meaningful items from home: photos, familiar furniture, personal keepsakes. A familiar environment can make a real difference in how settled and comfortable someone feels, and we want each resident to feel like their room truly belongs to them.",
      quick: ['Schedule a Visit', 'How soon can my loved one move in?']
    },
    // ── What makes Mi Casa special ────────────────────────────────
    {
      test: /what makes (mi casa|you|your home?|your facility) (special|different|unique|stand out)|why (choose|pick|select) mi casa|what sets you apart|what.?s unique about|why mi casa/i,
      reply: "Our size, our people, and our philosophy. We're a real home in a real neighborhood, not a wing of a large building. Because we keep our setting small and intimate, staff genuinely know every resident: their preferences, their routines, their stories. You can read more on our FAQ page.",
      nav: 'faq.html',
      quick: ['Schedule a Visit', 'What is Home Plus?', 'Meet the Team']
    },
    // ── Comparison vs. nursing home ───────────────────────────────
    {
      test: /different (from|than|vs\.?)|difference (between|from)|(compared? to|vs\.?) (a )?(nursing|assisted|large|traditional)|better than (nursing|assisted|large)|how do(es)? (mi casa|home plus|you) (compare|differ|stack up)/i,
      reply: "The biggest difference is size and setting. Nursing homes and assisted living communities typically serve dozens or hundreds of residents in large buildings. Mi Casa is a real house in a real neighborhood. That smaller scale means more personal relationships, more consistent care, and a daily experience that actually feels like home. See a full comparison on our Home Plus page.",
      nav: 'home-plus.html',
      quick: ['Schedule a Visit', 'What is Home Plus?']
    },
    // ── Privacy ───────────────────────────────────────────────────
    {
      test: /\bprivacy\b|private (information|details?|records?)|hipaa|confidential|protect (my|their|resident) (information|data|privacy)/i,
      reply: "We take resident privacy seriously and follow all applicable state and federal privacy standards. Information about residents is kept confidential and shared only with those directly involved in their care.",
      quick: ['Is Mi Casa licensed?', 'Schedule a Visit']
    },
    // ── Blog ─────────────────────────────────────────────────────
    {
      test: /\bblog\b|our blog|mi casa blog|blog post|read (a |the )?(guide|article|post)|care guide|elder care (guide|article|resource)|read more about home plus|where can i (read|learn) more/i,
      reply: "We publish guides and resources on our blog to help Kansas families navigate elder care decisions. Topics include Home Plus, care options, and what to expect. Taking you there now.",
      nav: 'blog.html',
      quick: ['What is Home Plus?', 'Schedule a Visit']
    },
    // ── Newsletter ───────────────────────────────────────────────
    {
      test: /newsletter|casa chronicle|the chronicle|updates from (mi casa|the home|both homes)|what.?s new at mi casa|news from (the home|mi casa)|latest (news|updates|highlights)/i,
      reply: "We publish The Casa Chronicles, our newsletter, with updates, resident spotlights, activity highlights, and upcoming events from both our Tyler and Towanda homes. Taking you there now.",
      nav: 'newsletter.html',
      quick: ['Schedule a Visit', 'See the Gallery']
    },
    // ── Performing / volunteering ─────────────────────────────────
    {
      test: /perform|performer|entertain(er|ment)?|volunteer|bring joy|visit (the )?residents|sing(er)?|musician|band|magic(ian)?|animal visit|therapy animal|craft (session|class|visit)|storytell|come (to )?perform|come (to )?entertain|share (your|my|their) (gift|talent)|can (i|we) (perform|come|volunteer|entertain)|interested in (performing|volunteering|entertaining)/i,
      reply: "We love welcoming performers, entertainers, and volunteers who want to bring joy to our residents. Whether you play music, do magic, bring animals, lead crafts, or share stories, we'd love to have you. Our Performer Application page has all the details. Taking you there now.",
      nav: 'perform.html',
      quick: ['Careers', 'Schedule a Visit']
    },
    // ── Careers ───────────────────────────────────────────────────
    {
      test: /career|job|hiring|apply|work (there|here|for you)|position|cna|cma|nurse|employment|join (our|the) team|open roles?/i,
      reply: "We are grateful to be hiring caring, dedicated people to join our team. We have open positions for CNAs, CMAs, and Nurses. I'll take you to our Careers page now.",
      nav: 'careers.html',
      quick: ['What positions are open?']
    },
    // ── Open positions ────────────────────────────────────────────
    {
      test: /what positions|open (positions|roles|jobs)/i,
      reply: "We currently have openings for: a <strong>CNA</strong> (Certified Nursing Assistant), a <strong>CMA</strong> (Certified Medication Aide), and a <strong>Nurse</strong> (RN or LPN). Heading to our Careers page now.",
      nav: 'careers.html'
    },
    // ── Pricing / cost ────────────────────────────────────────────
    {
      test: /price|cost|how much|rate|fee|afford|expense|is it (expensive|affordable|costly|cheap)|what does (it|care) cost|how (do i|can i|do you) pay|ways? to pay|billing/i,
      reply: "We understand that cost is an important part of this decision. We work with Medicaid (HCBS), long-term care insurance, and private pay. I'll take you to the Payment Options section on our About Us page now.",
      nav: 'about.html#payment-heading'
    },
    // ── Payment / insurance ───────────────────────────────────────
    {
      test: /payment option|insurance|medicaid|medicare|hcbs|mco|coverage|pay for|financial|do you (take|accept)/i,
      reply: "Mi Casa works with Medicaid through Kansas HCBS waiver programs, most long-term care insurance plans, and private pay. Because coverage depends on each person's individual situation, our team is happy to walk you through the options. Taking you to the Payment Options section now.",
      nav: 'about.html#payment-heading'
    },
    // ── Gallery ───────────────────────────────────────────────────
    {
      test: /gallery|photo|picture|image|look like|looks like|can.{0,6}see (the )?(house|home|place|facility|facilities|room|it|them|inside)|see (the )?(house|home|place|facility|facilities|inside)|what (do|does) (the )?(house|home|place|facilities) look|show me (the )?(house|home|place|facility|facilities|inside|around)/i,
      reply: "We have photos of both our Towanda House and Tyler House locations in the gallery. Taking you there now.",
      nav: 'gallery.html'
    },
    // ── Meet the team ─────────────────────────────────────────────
    {
      test: /meet (the|our|your) (team|staff)|(our|the|your) (team|staff)\b|\bstaff\b|caregivers?|who (works?|cares? for|is on your team|are (on )?the (team|staff))/i,
      reply: "Our team is dedicated to providing compassionate, personal care to every resident. I'll take you to our Meet the Team section now.",
      nav: 'about.html#staff-heading',
      quick: ['Our Locations', 'Schedule a Visit', 'What is Home Plus?']
    },
    // ── Locations ─────────────────────────────────────────────────
    {
      test: /\b(our )?locations?\b|where (are|is) (you|mi casa|your (homes?|houses?|facilit))|address(es)?|direction|towanda house|tyler house|wichita/i,
      reply: "Mi Casa Care Homes has two locations: our Tyler House in Wichita, KS and our Towanda House in Towanda, KS. I'll take you to our Locations section now.",
      nav: 'about.html#locations-heading',
      quick: ['Schedule a Visit', 'Meet the Team']
    },
    // ── About Mi Casa ─────────────────────────────────────────────
    {
      test: /about|who (are|is|runs?|owns?|operates?|manages?|is behind|is in charge of?) (you|mi casa|the place|this place|it|here)|tell me (about|more)|your story|the company|the organization|who.{0,10}(founder|owner|operator)/i,
      reply: "Mi Casa Care Homes is a small, licensed care home in Kansas serving adults who need personal care and nursing support. We believe that people deserve to receive care in a setting that truly feels like home -- one where staff know residents by name and families feel welcome. Taking you to our About Us page now.",
      nav: 'about.html',
      quick: ['What is Home Plus?', 'Meet the Team', 'Schedule a Visit']
    },
    // ── Contact ───────────────────────────────────────────────────
    {
      test: /contact|phone|email|reach|get in touch|talk to someone/i,
      reply: "We would love to hear from you. The easiest way to reach our team is through the <a href='schedule.html'>Schedule a Visit form</a>. We typically respond within one business day."
    },
    // ── Site navigation ───────────────────────────────────────────
    {
      test: /page|navigate|find|where (is|can i find)|how do i get to/i,
      reply: "Here is a guide to our website: <a href='index.html'>Home</a> &middot; <a href='about.html'>About Us</a> &middot; <a href='about.html#staff-heading'>Meet the Team</a> &middot; <a href='about.html#locations-heading'>Our Locations</a> &middot; <a href='about.html#payment-heading'>Payment Options</a> &middot; <a href='home-plus.html'>What is Home Plus?</a> &middot; <a href='blog.html'>Blog</a> &middot; <a href='newsletter.html'>Newsletter</a> &middot; <a href='faq.html'>FAQ</a> &middot; <a href='gallery.html'>Gallery</a> &middot; <a href='careers.html'>Careers</a> &middot; <a href='schedule.html'>Schedule a Visit</a>"
    },
    // ── Thanks ────────────────────────────────────────────────────
    {
      test: /thank|thanks|helpful|appreciate|that.?s (great|good|wonderful|perfect)/i,
      reply: "Thank you for reaching out. We know this is an important time for your family, and we're honored to be part of that conversation. Please don't hesitate to ask anything else, or <a href='schedule.html'>schedule a visit</a> whenever you're ready."
    },
    // ── Social media ──────────────────────────────────────────────
    {
      test: /social|facebook|instagram|follow (us|mi casa)|find (you|mi casa) on|connect with (you|us)/i,
      replyFn: function () {
        var socials = window.MI_CASA_SOCIALS || [];
        if (!socials.length) {
          return "Follow us on social media to stay up to date with life at Mi Casa! Check back soon for links.";
        }
        var links = socials.map(function (s) {
          return "<a href='" + s.url + "' target='_blank' rel='noopener noreferrer'>Follow us on " + s.name + "</a>";
        }).join(' &middot; ');
        return "Follow us on social media to stay up to date with life at Mi Casa Care Homes! " + links;
      }
    }
  ];

  var fallback = "That's a great question, and we want to make sure you get the right answer. Our team would be happy to help -- please use the <a href='schedule.html'>Schedule a Visit form</a> to reach us directly. We typically respond within one business day.";

  // ─────────────────────────────────────────────
  // Secondary intent scorer
  // Runs when no primary rule matches. Scores the input against
  // weighted keyword signals per intent and picks the best match
  // above a threshold. Handles vague / conversational phrasing.
  // ─────────────────────────────────────────────
  var intents = [
    {
      nav: 'gallery.html',
      reply: "We have photos of both our Towanda House and Tyler House locations in our gallery. Taking you there now.",
      threshold: 4,
      signals: [
        { w: 5, p: ['look like', 'looks like', 'what it looks', 'what they look'] },
        { w: 4, p: ['can i see', 'can we see', 'show me', 'see inside', 'see around'] },
        { w: 3, p: ['photo', 'photos', 'picture', 'pictures', 'image', 'images', 'gallery'] },
        { w: 2, p: ['houses', 'facility', 'facilities', 'rooms', 'inside', 'interior', 'appearance'] },
        { w: 1, p: ['house', 'visual', 'tour'] }
      ]
    },
    {
      nav: 'about.html#payment-heading',
      reply: "We work with Medicaid (HCBS), long-term care insurance, and private pay. I'll take you to the Payment Options section now.",
      threshold: 3,
      signals: [
        { w: 5, p: ['do you take insurance', 'do you accept insurance', 'take insurance', 'accept insurance', 'how do i pay', 'how can i pay', 'how to pay', 'ways to pay'] },
        { w: 4, p: ['insurance', 'medicaid', 'medicare', 'financial assistance', 'covered by', 'is it covered', 'billing', 'is it expensive', 'is it affordable', 'can i afford'] },
        { w: 3, p: ['pay', 'payment', 'cost', 'price', 'afford', 'fee', 'expense', 'coverage', 'financial'] },
        { w: 2, p: ['money', 'fund', 'funding', 'rate', 'rates'] }
      ]
    },
    {
      nav: 'about.html#staff-heading',
      reply: "Our team is dedicated to providing compassionate, personal care to every resident. Taking you to our Meet the Team section now.",
      threshold: 3,
      signals: [
        { w: 6, p: ['meet the team', 'meet your team', 'meet your staff', 'meet our team', 'who is the team', 'who is on the team'] },
        { w: 4, p: ['team members', 'staff members', 'your caregivers', 'the caregivers', 'who works there', 'who works here'] },
        { w: 3, p: ['team', 'staff', 'caregiver', 'caregivers', 'employees', 'who works'] },
        { w: 2, p: ['people', 'leadership', 'joslin'] }
      ]
    },
    {
      nav: 'about.html#locations-heading',
      reply: "We have two homes: our Tyler House in Wichita and our Towanda House in Towanda, Kansas. Taking you to our Locations section now.",
      threshold: 3,
      signals: [
        { w: 6, p: ['our locations', 'your locations', 'where are you located', 'where is mi casa', 'where are you'] },
        { w: 4, p: ['address', 'directions', 'how to find', 'find you', 'find us', 'get there'] },
        { w: 3, p: ['location', 'locations', 'wichita', 'towanda', 'tyler house', 'towanda house'] },
        { w: 2, p: ['kansas', 'city', 'neighborhood', 'nearby', 'close to'] }
      ]
    },
    {
      nav: 'about.html',
      reply: "Mi Casa is a small, licensed care home in Kansas run by a dedicated team that believes care should feel like home. Taking you to our About Us page now.",
      threshold: 4,
      signals: [
        { w: 6, p: ['who runs', 'who owns', 'who operates', 'who manages', 'who is in charge', 'who is behind', 'who founded', 'who started'] },
        { w: 5, p: ['about the company', 'about the organization', 'about the facility', 'tell me about you', 'more about you'] },
        { w: 3, p: ['company', 'organization', 'founder', 'owner', 'operator', 'ownership', 'management', 'history', 'background', 'mission', 'story'] },
        { w: 2, p: ['people', 'leadership'] }
      ]
    },
    {
      nav: 'careers.html',
      reply: "We're hiring caring, dedicated people to join our team. I'll take you to our Careers page now.",
      threshold: 3,
      signals: [
        { w: 6, p: ['are you hiring', 'do you have jobs', 'do you have openings', 'do you have positions', 'any job openings', 'any openings'] },
        { w: 4, p: ['hiring', 'job openings', 'job opportunities', 'work for you', 'work there', 'join your team', 'join the team', 'open positions'] },
        { w: 3, p: ['jobs', 'career', 'careers', 'employment', 'apply', 'opening', 'vacancy'] },
        { w: 2, p: ['work', 'opportunity', 'opportunities', 'position', 'role'] }
      ]
    },
    {
      nav: 'home-plus.html',
      reply: "A Home Plus facility is a state-licensed residential care setting serving a small number of people in a real home. Taking you to our Home Plus page now.",
      threshold: 4,
      signals: [
        { w: 6, p: ['home plus', 'homeplus'] },
        { w: 4, p: ['what kind of facility', 'type of facility', 'type of care', 'kind of care', 'residential care', 'licensed facility'] },
        { w: 3, p: ['kdads', 'certification', 'licensed', 'license', 'regulated'] },
        { w: 2, p: ['small facility', 'small home', 'residential'] }
      ]
    },
    {
      nav: 'schedule.html',
      reply: "We'd love to show you around! Taking you to our Schedule a Visit page now.",
      threshold: 4,
      signals: [
        { w: 5, p: ['schedule a visit', 'book a visit', 'book a tour', 'set up a visit', 'set up a tour', 'make an appointment'] },
        { w: 4, p: ['schedule', 'appointment', 'come in', 'come see', 'stop by'] },
        { w: 3, p: ['visit', 'tour'] },
        { w: 2, p: ['in person', 'see the place', 'see the home', 'see the house'] }
      ]
    },
    {
      nav: 'faq.html',
      reply: "Our FAQ covers the questions we hear most. Taking you there now.",
      threshold: 3,
      signals: [
        { w: 6, p: ['faq', 'frequently asked', 'common questions', 'questions and answers', 'q and a', 'q&a'] },
        { w: 4, p: ['frequently', 'common question', 'questions you get', 'questions families ask'] },
        { w: 3, p: ['question', 'questions', 'answers', 'wondering', 'curious'] },
        { w: 2, p: ['help', 'information', 'learn more'] }
      ]
    },
    // ── Activities / daily life ───────────────────────────────────
    {
      nav: null,
      reply: "We engage residents in daily activities that bring joy, connection, and purpose: conversation, music, games, seasonal crafts, and time outdoors when weather allows. We build each person's days around what they personally enjoy.",
      threshold: 4,
      signals: [
        { w: 5, p: ['what do you do all day', 'what do residents do', 'what do they do', 'typical day', 'day look like', 'daily life', 'daily routine', 'daily schedule'] },
        { w: 4, p: ['activities', 'programming', 'entertainment', 'activities program', 'day program'] },
        { w: 3, p: ['music', 'games', 'crafts', 'outdoors', 'outdoor', 'activities'] },
        { w: 2, p: ['busy', 'engaged', 'active', 'routine', 'schedule'] }
      ]
    },
    // ── Visitation / family visits ────────────────────────────────
    {
      nav: null,
      reply: "Families are always welcome. We believe that staying connected to loved ones is essential to wellbeing, and we encourage regular visits. Please reach out if you have questions about our current visiting guidelines.",
      threshold: 4,
      signals: [
        { w: 6, p: ['can family visit', 'can family come', 'can i visit', 'can we visit', 'can we come', 'are visitors welcome', 'family allowed to visit'] },
        { w: 5, p: ['visitation', 'visiting hours', 'visiting policy', 'visitation policy', 'can visitors come'] },
        { w: 3, p: ['visit', 'visits', 'family', 'visitors', 'come see'] },
        { w: 2, p: ['open', 'allowed', 'welcome', 'policy'] }
      ]
    },
    // ── Health and safety ─────────────────────────────────────────
    {
      nav: null,
      reply: "Safety is a top priority at Mi Casa. We are licensed and inspected by KDADS, follow established health and emergency protocols, and keep families informed whenever there are health concerns in the home.",
      threshold: 4,
      signals: [
        { w: 6, p: ['is it safe', 'how safe is it', 'how safe are you', 'is my loved one safe', 'will they be safe'] },
        { w: 5, p: ['health and safety', 'safety protocols', 'safety measures', 'safety standards', 'safety record'] },
        { w: 3, p: ['safe', 'safety', 'secure', 'protected', 'protection'] },
        { w: 2, p: ['regulations', 'standards', 'inspections', 'oversight', 'quality'] }
      ]
    },
    // ── Meals / food ──────────────────────────────────────────────
    {
      nav: null,
      reply: "Residents enjoy home-cooked meals prepared fresh in our kitchen. We accommodate dietary preferences and nutritional needs, and mealtimes are shared together to keep daily life feeling normal and connected.",
      threshold: 4,
      signals: [
        { w: 6, p: ['what do you eat', 'what do residents eat', 'what do they eat', 'home cooked', 'home-cooked meals'] },
        { w: 5, p: ['food', 'meals', 'dining', 'menu', 'cooking', 'what do you serve'] },
        { w: 3, p: ['breakfast', 'lunch', 'dinner', 'nutrition', 'dietary', 'eat'] },
        { w: 2, p: ['kitchen', 'fresh', 'cook', 'prepared'] }
      ]
    },
    // ── Memory care ───────────────────────────────────────────────
    {
      nav: null,
      reply: "We're experienced in caring for residents with memory-related challenges including dementia and Alzheimer's. Our small, intimate setting tends to be calming and familiar, which can be especially meaningful for residents with memory loss. Our team adapts care to meet each resident where they are.",
      threshold: 4,
      signals: [
        { w: 6, p: ['memory care', 'dementia care', 'alzheimer', 'memory loss', 'dementia', 'cognitive decline'] },
        { w: 5, p: ['memory', 'forgetful', 'confused', 'confusion', 'cognitive impairment'] },
        { w: 3, p: ['memory', 'dementia', 'alzheimer', 'cognitive', 'forgetful', 'confused'] },
        { w: 2, p: ['brain', 'mental', 'forgetting', 'remembering'] }
      ]
    },
    // ── Home feel / atmosphere ────────────────────────────────────
    {
      nav: null,
      reply: "Mi Casa really does feel like a home. Residents share meals together, relax in common living spaces, and live in a real neighborhood. The small size means staff and residents genuinely get to know each other. Many families tell us the warmth of the place surprised them most.",
      threshold: 4,
      signals: [
        { w: 6, p: ['what is it like', 'feels like home', 'like a home', 'like a family', 'home feel', 'home-like'] },
        { w: 5, p: ['atmosphere', 'feel', 'environment', 'vibe', 'culture', 'community feel'] },
        { w: 3, p: ['warm', 'welcoming', 'cozy', 'comfortable', 'peaceful', 'friendly'] },
        { w: 2, p: ['environment', 'setting', 'place', 'home', 'house'] }
      ]
    },
    // ── Performing / volunteering ─────────────────────────────────
    {
      nav: 'perform.html',
      reply: "We love welcoming performers, entertainers, and volunteers who want to bring joy to our residents. Our Performer Application page has all the details. Taking you there now.",
      threshold: 4,
      signals: [
        { w: 6, p: ['perform at', 'volunteer at', 'entertain at', 'perform for', 'volunteer for', 'entertainer application', 'performer application'] },
        { w: 5, p: ['perform', 'volunteer', 'entertain', 'bring joy', 'share my talent', 'share my gift'] },
        { w: 3, p: ['musician', 'singer', 'band', 'magician', 'storyteller', 'therapy animal', 'animal visit', 'craft session'] },
        { w: 2, p: ['guitar', 'piano', 'music', 'magic', 'animals', 'crafts', 'stories', 'talent'] }
      ]
    },
    // ── Blog / resources ─────────────────────────────────────────
    {
      nav: 'blog.html',
      reply: "We publish care guides and resources for Kansas families on our blog. Taking you there now.",
      threshold: 3,
      signals: [
        { w: 6, p: ['blog', 'your blog', 'mi casa blog', 'blog post', 'care guide', 'elder care guide'] },
        { w: 4, p: ['article', 'articles', 'guide', 'guides', 'read more', 'learn more', 'read about'] },
        { w: 3, p: ['resource', 'resources', 'information', 'reading', 'posts', 'written'] },
        { w: 2, p: ['learn', 'understand', 'explain'] }
      ]
    },
    // ── Newsletter ───────────────────────────────────────────────
    {
      nav: 'newsletter.html',
      reply: "We publish The Casa Chronicles, our newsletter, with updates and highlights from both homes. Taking you there now.",
      threshold: 3,
      signals: [
        { w: 8, p: ['newsletter', 'casa chronicle', 'the chronicle', 'casa chronicle newsletter'] },
        { w: 5, p: ["what's new", "what is new", 'latest news', 'latest updates', 'news from the home', 'updates from mi casa'] },
        { w: 3, p: ['news', 'updates', 'highlights', 'monthly', 'issue'] }
      ]
    },
    // ── Family communication ──────────────────────────────────────
    {
      nav: null,
      reply: "We keep families informed and welcome your calls anytime. You can reach us at (316) 777-6655, and we proactively communicate with families when there are health changes or important updates. We also publish <a href='newsletter.html'>The Casa Chronicles</a>, our newsletter, with highlights and updates from both homes. Families are partners in care, not visitors.",
      threshold: 4,
      signals: [
        { w: 6, p: ['stay in touch', 'keep in touch', 'how do i communicate', 'how will you communicate', 'updates on my loved one', 'get updates'] },
        { w: 5, p: ['communicate', 'communication', 'updates', 'contact staff', 'reach staff', 'call the home'] },
        { w: 3, p: ['in touch', 'informed', 'updated', 'contact', 'reach out', 'check in'] },
        { w: 2, p: ['family', 'communicate', 'phone', 'call', 'update'] }
      ]
    }
  ];

  function detectIntent(text) {
    var lower = text.toLowerCase();
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < intents.length; i++) {
      var intent = intents[i];
      var score  = 0;
      for (var j = 0; j < intent.signals.length; j++) {
        var sig = intent.signals[j];
        for (var k = 0; k < sig.p.length; k++) {
          if (lower.indexOf(sig.p[k]) >= 0) {
            score += sig.w;
            break; // count each signal group once
          }
        }
      }
      if (score >= intent.threshold && score > bestScore) {
        bestScore = score;
        best = intent;
      }
    }
    return best;
  }

  function respond(text) {
    // !! REPLACE THIS FUNCTION BODY WITH YOUR AI API CALL !!
    // Example: fetch('/api/chat', { method:'POST', body: JSON.stringify({ message: text }) })
    //   .then(r => r.json()).then(d => addMessage(d.reply, 'assistant'));

    setTimeout(function () {
      var reply = fallback;
      var quick = null;
      var nav   = null;

      // Layer 1: exact regex rules
      var matched = false;
      for (var i = 0; i < rules.length; i++) {
        if (rules[i].test.test(text)) {
          reply   = rules[i].replyFn ? rules[i].replyFn() : rules[i].reply;
          quick   = rules[i].quick || null;
          nav     = rules[i].nav   || null;
          matched = true;
          break;
        }
      }

      // Layer 2: intent scoring for vague / conversational phrasing
      if (!matched) {
        var intent = detectIntent(text);
        if (intent) {
          reply   = intent.reply;
          nav     = intent.nav;
          matched = true;
        }
      }

      // After the first successful match, future greetings are shortened
      if (matched) sessionStorage.setItem(HELPED_KEY, '1');

      addMessage(reply, 'assistant');
      if (quick) addQuickReplies(quick);
      if (nav)   navigateTo(nav);
    }, 420);
  }

  // ─────────────────────────────────────────────
  // Re-open after cross-page navigation
  // ─────────────────────────────────────────────
  if (sessionStorage.getItem(NAV_KEY)) {
    sessionStorage.removeItem(NAV_KEY);
    sessionStorage.setItem(AUTO_KEY, '1'); // prevent the 5-second auto-open from firing too
    openChat();
  }

  // ─────────────────────────────────────────────
  // Auto-open after 5 seconds (once per session)
  // ─────────────────────────────────────────────
  setTimeout(function () {
    if (isOpen || sessionStorage.getItem(AUTO_KEY)) return;
    isOpen  = true;
    greeted = true;
    chatWin.hidden = false;
    toggleBtn.setAttribute('aria-expanded', 'true');
    var msg = sessionStorage.getItem(HELPED_KEY)
      ? "How can I help?"
      : "Hi, I'm Casa Companion. I'm here to help you learn more about Mi Casa Care Homes. We know that finding the right care for a loved one is an important decision, and we're glad you're here. How can we help you today?";
    addMessage(msg, 'assistant');
    addQuickReplies(MAIN_QUICK);
  }, 5000);

  // ─────────────────────────────────────────────
  // Event listeners
  // ─────────────────────────────────────────────
  toggleBtn.addEventListener('click', function () {
    isOpen ? closeChat() : openChat();
  });

  closeBtn.addEventListener('click', closeChat);
  expandBtn.addEventListener('click', toggleFullscreen);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    respond(text);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (isFullscreen) toggleFullscreen();
      else if (isOpen) closeChat();
    }
  });

}());
