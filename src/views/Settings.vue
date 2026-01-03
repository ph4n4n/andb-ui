<template>
  <div class="h-screen flex flex-col pt-0 bg-gray-50 dark:bg-gray-900" :style="{ fontFamily: appStore.fontFamilies.general, fontSize: appStore.fontSizes.main + 'px' }">
    <!-- Header -->
    <Header />

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- App Sidebar (The main navigation) -->
      <Sidebar />
      
      <!-- Settings Workspace -->
      <main class="flex-1 flex overflow-hidden bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
        <!-- Settings Category Sidebar -->
        <div class="w-64 border-r border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 backdrop-blur-md flex flex-col shrink-0">
          <div class="p-8 pb-4">
            <h1 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 mb-1">
              <SettingsIcon class="w-5 h-5 text-primary-500" />
              Settings
            </h1>
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest opacity-60">System Configuration</p>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 space-y-1">
            <button 
              v-for="cat in categories" :key="cat.id"
              @click="activeCategory = cat.id"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden"
              :class="activeCategory === cat.id 
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 active:scale-95' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'"
            >
              <component :is="cat.icon" class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span class="text-[11px] font-bold uppercase tracking-widest">{{ cat.label }}</span>
              <div v-if="activeCategory === cat.id" class="absolute inset-0 bg-white/10 translate-x-[-100%] animate-[shimmer_3s_infinite] pointer-events-none"></div>
            </button>
          </div>

          <!-- Bottom Actions -->
          <div class="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <button @click="resetToDefaults" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all border border-transparent hover:border-red-200/50 dark:hover:border-red-900/50">
              <RotateCcw class="w-3.5 h-3.5" />
              Reset All Data
            </button>
          </div>
        </div>
        
        <!-- Category Detail Pane -->
        <div class="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div class="max-w-4xl mx-auto">
            
            <!-- INTERFACE & TYPOGRAPHY SECTION -->
            <div v-if="activeCategory === 'interface'" class="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div class="flex items-center gap-4 mb-10">
                <div class="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shadow-inner">
                  <MonitorSmartphone class="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Interface & Aesthetics</h2>
                  <p class="text-xs text-gray-500 font-medium uppercase tracking-widest opacity-70">Personalize your workspace experience</p>
                </div>
              </div>

              <!-- Main UI Settings -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="md:col-span-2 space-y-6">
                  <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Theme selection</label>
                    <div class="flex items-center gap-6 bg-gray-50/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
                      <button 
                        @click="settingsStore.setTheme('system')"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                        :class="settings.theme === 'system' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'"
                      >
                         <div class="w-3 h-3 rounded-full border-2 flex items-center justify-center" :class="settings.theme === 'system' ? 'border-primary-500' : 'border-gray-300'">
                           <div v-if="settings.theme === 'system'" class="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                         </div>
                         Sync with system
                      </button>
                      <button 
                        @click="settingsStore.setTheme(settings.theme === 'system' ? 'dark' : settings.theme)"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                        :class="settings.theme !== 'system' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'"
                      >
                         <div class="w-3 h-3 rounded-full border-2 flex items-center justify-center" :class="settings.theme !== 'system' ? 'border-primary-500' : 'border-gray-300'">
                           <div v-if="settings.theme !== 'system'" class="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                         </div>
                         Manual
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
                    <div 
                      v-for="t in themeOptions" :key="t.id"
                      @click="settingsStore.setTheme(t.id)"
                      class="group cursor-pointer space-y-3"
                    >
                      <div 
                        class="aspect-[16/10] rounded-xl border-2 transition-all duration-300 overflow-hidden relative"
                        :class="[
                          settings.theme === t.id 
                            ? 'border-primary-500 shadow-lg shadow-primary-500/10 scale-[1.02]' 
                            : 'border-transparent bg-gray-100 dark:bg-gray-800 group-hover:border-gray-200 dark:group-hover:border-gray-700'
                        ]"
                      >
                        <!-- Theme Thumbnail Mockup -->
                        <div class="absolute inset-0 flex flex-col" :style="{ backgroundColor: t.preview.main }">
                          <div class="h-1.5 w-full flex gap-0.5 p-0.5 border-b opacity-20" :style="{ backgroundColor: t.preview.sidebar, borderColor: 'currentColor' }">
                             <div class="w-1 h-1 rounded-full bg-red-400"></div>
                             <div class="w-1 h-1 rounded-full bg-amber-400"></div>
                             <div class="w-1 h-1 rounded-full bg-green-400"></div>
                          </div>
                          <div class="flex-1 flex overflow-hidden">
                             <div class="w-1/4 h-full border-r opacity-20" :style="{ backgroundColor: t.preview.sidebar, borderColor: 'currentColor' }"></div>
                             <div class="flex-1 p-2 space-y-1">
                                <div class="h-1 w-2/3 rounded-full opacity-20" :class="t.dark ? 'bg-gray-600' : 'bg-gray-300'"></div>
                                <div class="h-1.5 w-full rounded border border-dashed opacity-10" :class="t.dark ? 'border-gray-500' : 'border-gray-400'"></div>
                                <div class="grid grid-cols-3 gap-1 mt-2">
                                   <div class="h-3 rounded-sm opacity-20" :class="t.dark ? 'bg-gray-800' : 'bg-gray-100'"></div>
                                   <div class="h-3 rounded-sm opacity-20" :class="t.dark ? 'bg-gray-800' : 'bg-gray-100'"></div>
                                   <div class="h-3 rounded-sm opacity-20 bg-primary-500"></div>
                                </div>
                             </div>
                          </div>
                        </div>

                        <!-- Checkmark overlay for selected -->
                        <div v-if="settings.theme === t.id" class="absolute inset-0 bg-primary-500/5 flex items-center justify-center">
                           <div class="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg transform scale-110 animate-in zoom-in-50 duration-300">
                             <Check class="w-4 h-4" />
                           </div>
                        </div>
                      </div>
                      
                      <div class="flex items-center gap-2 px-1">
                        <div class="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors" :class="settings.theme === t.id ? 'border-primary-500' : 'border-gray-300 dark:border-gray-700'">
                           <div v-if="settings.theme === t.id" class="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                        </div>
                        <span class="text-[10px] font-black uppercase tracking-widest transition-colors" :class="settings.theme === t.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-600'">{{ t.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Language</label>
                  <div class="relative group">
                    <select v-model="settings.language" @change="updateLanguage" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-primary-500/20 group-hover:border-primary-500 transition-all">
                      <option value="en">English (Global)</option>
                      <option value="vi">Tiếng Việt (Vietnam)</option>
                    </select>
                    <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <!-- Timezone Select -->
                <div class="md:col-span-2 space-y-2 pt-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Application Timezone</label>
                  <div class="relative group">
                    <select v-model="settings.timezone" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-primary-500/20 group-hover:border-primary-500 transition-all">
                      <option v-for="tz in timezones" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
                    </select>
                    <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <!-- Navigation Style -->
                <div class="md:col-span-2 space-y-4 pt-4">
                   <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Navigation Architecture</label>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <button 
                       @click="appStore.navStyle = 'vertical-list'"
                       class="flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group"
                       :class="appStore.navStyle === 'vertical-list' 
                         ? 'bg-white dark:bg-gray-800 border-primary-500 shadow-xl shadow-primary-500/10 ring-1 ring-primary-500/20' 
                         : 'bg-transparent border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'"
                     >
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="appStore.navStyle === 'vertical-list' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'">
                        <LayoutList class="w-5 h-5" />
                      </div>
                       <div class="text-left">
                         <div class="text-xs font-black text-gray-900 dark:text-white uppercase leading-none mb-1">Vertical List</div>
                         <div class="text-[9px] text-gray-400 uppercase tracking-tighter">Professional enterprise sidebar</div>
                       </div>
                     </button>

                     <button 
                       @click="appStore.navStyle = 'horizontal-tabs'"
                       class="flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group"
                       :class="appStore.navStyle === 'horizontal-tabs' 
                         ? 'bg-white dark:bg-gray-800 border-primary-500 shadow-xl shadow-primary-500/10 ring-1 ring-primary-500/20' 
                         : 'bg-transparent border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'"
                     >
                       <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="appStore.navStyle === 'horizontal-tabs' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'">
                         <ColumnsIcon class="w-5 h-5" />
                       </div>
                       <div class="text-left">
                         <div class="text-xs font-black text-gray-900 dark:text-white uppercase leading-none mb-1">Horizontal Tabs</div>
                         <div class="text-[9px] text-gray-400 uppercase tracking-tighter">Modern minimalist top-bar</div>
                       </div>
                     </button>
                   </div>
                </div>
              </div>

              <!-- Typography Matrix -->
              <div class="pt-8 border-t border-gray-100 dark:border-gray-800">
                <div class="mb-8">
                  <h3 class="text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1">Typography Architecture</h3>
                  <p class="text-[10px] text-gray-400 uppercase tracking-tighter">Fine-tune typeface families and granular scaling</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div class="space-y-2">
                    <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-tight">Main UI Font</label>
                    <select v-model="appStore.fontFamilies.general" class="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/10 outline-none shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-900">
                      <option value="'Inter', sans-serif">Inter (Modern)</option>
                      <option value="'Roboto', sans-serif">Roboto (Legacy)</option>
                      <option value="'Outfit', sans-serif">Outfit (Geometric)</option>
                      <option value="'Segoe UI', sans-serif">System Native</option>
                    </select>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-tight">Monospace Code Font</label>
                    <select v-model="appStore.fontFamilies.code" class="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-primary-500/10 outline-none shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-900">
                      <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                      <option value="'Fira Code', monospace">Fira Code</option>
                      <option value="'Source Code Pro', monospace">Source Code Pro</option>
                      <option value="ui-monospace, monospace">System Native Mono</option>
                    </select>
                  </div>

                  <div class="md:col-span-2 mt-4">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Granular Size Matrix</label>
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      <div v-for="(size, key) in appStore.fontSizes" :key="key" class="p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all">
                        <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-2 truncate">{{ formatFontSizeKey(key) }}</label>
                        <select v-model.number="appStore.fontSizes[key]" class="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-black outline-none focus:ring-1 focus:ring-primary-500">
                          <option v-for="s in getFontSizeRange(key)" :key="s" :value="s">{{ s }}px</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Button Style / Visual Density -->
              <div class="pt-8 border-t border-gray-100 dark:border-gray-800">
                <div class="mb-8">
                  <h3 class="text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1">Visual Density & Button Styling</h3>
                  <p class="text-[10px] text-gray-400 uppercase tracking-tighter">Choose the aesthetic weight of active elements</p>
                </div>

                <div class="flex flex-col lg:flex-row gap-8">
                  <div class="lg:w-1/3 space-y-3">
                    <button 
                      v-for="style in buttonStyles" :key="style.id"
                      @click="appStore.buttonStyle = style.id"
                      class="w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group"
                      :class="appStore.buttonStyle === style.id 
                        ? 'bg-white dark:bg-gray-800 border-primary-500 shadow-xl shadow-primary-500/10 ring-1 ring-primary-500/20' 
                        : 'bg-transparent border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'"
                    >
                      <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" :class="appStore.buttonStyle === style.id ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-primary-500'">
                          <component :is="style.icon" class="w-5 h-5" />
                        </div>
                        <div class="text-left">
                          <div class="text-xs font-black text-gray-900 dark:text-white uppercase leading-none mb-1">{{ style.label }}</div>
                          <div class="text-[9px] text-gray-500 uppercase tracking-tighter">{{ style.desc }}</div>
                        </div>
                      </div>
                      <div v-if="appStore.buttonStyle === style.id" class="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check class="w-2.5 h-2.5 text-white" />
                      </div>
                    </button>
                  </div>

                  <!-- Live Preview -->
                  <div class="lg:w-2/3 bg-gray-50/50 dark:bg-gray-950/50 rounded-2xl p-8 border border-gray-100/50 dark:border-gray-800/50 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div class="absolute inset-0 bg-primary-500/[0.02] dark:bg-primary-500/[0.01] pointer-events-none group-hover:bg-primary-500/[0.04] transition-all"></div>
                    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 mb-10 bg-primary-50 dark:bg-primary-950/30 px-4 py-2 rounded-full border border-primary-100 dark:border-primary-900/50 shadow-sm">Interactive Preview</span>
                    
                    <div class="flex flex-col items-center gap-10 w-full max-w-sm">
                      <div class="w-full flex flex-col items-center">
                        <span class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 opacity-60">Primary Trigger</span>
                        <button 
                          class="flex items-center justify-center font-black uppercase transition-all duration-300 active:scale-95"
                          :class="[
                            appStore.buttonStyle === 'full' ? 'px-10 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl text-[11px] tracking-[0.2em] shadow-xl shadow-primary-500/30' : '',
                            appStore.buttonStyle === 'minimal' ? 'px-8 py-2.5 bg-primary-500 text-white rounded-xl text-[10px] tracking-widest shadow-lg shadow-primary-500/10' : '',
                            appStore.buttonStyle === 'icons' ? 'w-14 h-14 bg-primary-500 text-white rounded-full shadow-2xl shadow-primary-500/30 hover:scale-110' : ''
                          ]"
                        >
                          <Zap class="w-5 h-5" :class="appStore.buttonStyle !== 'icons' ? 'mr-3' : ''" :fill="appStore.buttonStyle === 'full' ? 'currentColor' : 'none'" />
                          <span v-if="appStore.buttonStyle !== 'icons'">{{ appStore.buttonStyle === 'full' ? 'Initialize Analysis' : 'Analyze' }}</span>
                        </button>
                      </div>

                      <div class="flex items-center gap-16">
                        <div class="flex flex-col items-center">
                          <span class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 opacity-60">Secondary</span>
                          <button class="transition-all duration-300 active:scale-95 hover:scale-105" :class="[
                            appStore.buttonStyle === 'full' ? 'flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl text-[11px] font-black shadow-md' : '',
                            appStore.buttonStyle === 'minimal' ? 'flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl text-[10px] font-black' : '',
                            appStore.buttonStyle === 'icons' ? 'w-11 h-11 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm' : ''
                          ]">
                            <HistoryIcon class="w-4 h-4" />
                            <span v-if="appStore.buttonStyle !== 'icons'">Check History</span>
                          </button>
                        </div>
                        <div class="flex flex-col items-center">
                          <span class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 opacity-60">Utility</span>
                          <button class="transition-all duration-300 active:scale-95 group/u" :class="[
                            appStore.buttonStyle === 'full' ? 'flex items-center justify-center w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl shadow-inner hover:bg-indigo-100 transition-colors' : '',
                            appStore.buttonStyle === 'minimal' ? 'flex items-center justify-center w-10 h-10 bg-gray-50 dark:bg-gray-800/80 text-gray-400 rounded-xl' : '',
                            appStore.buttonStyle === 'icons' ? 'text-gray-400 hover:text-primary-500 hover:scale-125 transition-transform' : ''
                          ]">
                            <SettingsIcon class="w-4.5 h-4.5 group-hover/u:rotate-90 transition-transform duration-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ENVIRONMENTS SECTION -->
            <div v-if="activeCategory === 'environment'" class="animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div class="flex items-center gap-4 mb-12">
                <div class="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shadow-inner">
                  <Globe2 class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Database Environment Matrix</h2>
                  <p class="text-xs text-gray-500 font-medium uppercase tracking-widest opacity-70">Infrastructure hierarchy and lifecycle tiers</p>
                </div>
              </div>
              <EnvironmentManager />
            </div>

            <!-- CONNECTIONS SECTION -->
            <div v-if="activeCategory === 'connections'" class="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div class="flex items-center gap-4 mb-12">
                <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-inner">
                  <Link2 class="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Access Control & Credentials</h2>
                  <p class="text-xs text-gray-500 font-medium uppercase tracking-widest opacity-70">Manage server endpoints and secure database entry</p>
                </div>
              </div>
              <ConnectionManager />
            </div>

            <!-- PAIRS SECTION -->
            <div v-if="activeCategory === 'pairs' " class="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div class="flex items-center gap-4 mb-12">
                <div class="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shadow-inner">
                  <GitCompare class="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Synchronization Pairings</h2>
                  <p class="text-xs text-gray-500 font-medium uppercase tracking-widest opacity-70">Define logical flow between source and target environments</p>
                </div>
              </div>
              <ConnectionPairManager :enabled-environments="enabledEnvironments" />
            </div>

            <!-- BACKUP SECTION -->
            <div v-if="activeCategory === 'backup'" class="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div class="flex items-center gap-4 mb-12">
                <div class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-inner">
                  <Database class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Data Integrity & Portability</h2>
                  <p class="text-xs text-gray-500 font-medium uppercase tracking-widest opacity-70">Master configuration backups and recovery snapshots</p>
                </div>
              </div>
              <BackupManager />
            </div>

          </div>
        </div>
      </main>
    </div>

    <!-- Reset Data Confirmation Modal (Pro Style) -->
    <div v-if="showResetModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        class="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300"
        @click="showResetModal = false"
      ></div>
      
      <div class="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <!-- Modal Header -->
        <div class="px-8 pt-8 pb-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shadow-inner">
              <Trash2 class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Reset Application Data</h3>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Critical System Action</p>
            </div>
          </div>
          <button @click="showResetModal = false" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Modal Body -->
        <div class="px-8 py-6">
          <p class="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            Are you sure you want to completely purge the local application cache? This action is <span class="font-black text-red-500 underline decoration-2 underline-offset-2">irreversible</span>.
          </p>
          
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
            <h4 class="text-[9px] font-black text-red-700 dark:text-red-400 uppercase tracking-[0.2em] mb-4">The following will be purged:</h4>
            <div class="grid grid-cols-1 gap-3">
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-gray-400">
                   <Database class="w-4 h-4" />
                </div>
                <span class="text-[11px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-widest">Cached Schemas (DDL Exports)</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-gray-400">
                   <GitCompare class="w-4 h-4" />
                </div>
                <span class="text-[11px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-widest">Comparison Results & Diffs</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-gray-400">
                   <FileCode class="w-4 h-4" />
                </div>
                <span class="text-[11px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-widest">Generated Alter Statements</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-gray-400">
                   <Activity class="w-4 h-4" />
                </div>
                <span class="text-[11px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-widest">Migration History & Logs</span>
              </div>
            </div>
          </div>
          
           <div class="flex items-start gap-3 p-4 bg-primary-50 dark:bg-primary-950/20 rounded-xl border border-primary-100/50 dark:border-primary-900/50">
             <div class="p-1 bg-white dark:bg-gray-800 rounded-md text-primary-500 shadow-sm">
               <RotateCcw class="w-3 h-3" />
             </div>
             <p class="text-[10px] text-primary-700 dark:text-primary-300 font-bold uppercase leading-relaxed tracking-tight">
               * Your connection credentials and environmental tiers will be preserved.
             </p>
           </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="px-8 py-6 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <button 
            @click="showResetModal = false" 
            class="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="confirmResetData" 
            class="flex-[1.5] py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            :disabled="isResetting"
          >
            <RotateCcw v-if="isResetting" class="w-3.5 h-3.5 animate-spin" />
            <span v-if="isResetting">Purging...</span>
            <span v-else>Yes, Delete All</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { 
  ChevronDown, 
  Zap, 
  Check, 
  MousePointer2, 
  Layers,
  Settings as SettingsIcon, 
  Globe2, 
  Link2, 
  GitCompare, 
  MonitorSmartphone, 
  History as HistoryIcon,
  Database,
  Trash2,
  X,
  FileCode,
  Activity
} from 'lucide-vue-next'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import EnvironmentManager from '@/components/EnvironmentManager.vue'
import ConnectionPairManager from '@/components/ConnectionPairManager.vue'
import ConnectionManager from '@/components/ConnectionManager.vue'
import BackupManager from '@/components/BackupManager.vue'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import { useAppStore } from '@/stores/app'
import { useSettingsStore, themeOptions } from '@/stores/settings'
import { useOperationsStore } from '@/stores/operations'
import { setLanguage } from '@/i18n'


const appStore = useAppStore()
const connectionPairsStore = useConnectionPairsStore()
const settingsStore = useSettingsStore()
const operationsStore = useOperationsStore()
const route = useRoute()

const categories = [
  { id: 'interface', label: 'Interface', icon: MonitorSmartphone },
  { id: 'environment', label: 'Environments', icon: Globe2 },
  { id: 'connections', label: 'Connections', icon: Link2 },
  { id: 'pairs', label: 'Sync Pairs', icon: GitCompare },
  { id: 'backup', label: 'Backups', icon: Database }
]

const activeCategory = ref('interface')

// Handle deep linking from query params
onMounted(() => {
  if (route.query.cat && categories.find(c => c.id === route.query.cat)) {
    activeCategory.value = route.query.cat as string
  }
})

watch(() => route.query.cat, (newCat) => {
  if (newCat && categories.find(c => c.id === newCat)) {
    activeCategory.value = newCat as string
  }
})

const timezones = [
  { label: 'UTC (+00:00)', value: 'UTC' },
  { label: 'Asia/Ho_Chi_Minh (+07:00)', value: 'Asia/Ho_Chi_Minh' },
  { label: "Singapore (+08:00)", value: "Asia/Singapore" },
  { label: "Tokyo (+09:00)", value: "Asia/Tokyo" },
  { label: "Sydney (+11:00)", value: "Australia/Sydney" },
  { label: 'America/New_York (-05:00)', value: 'America/New_York' },
  { label: 'Europe/London (+00:00)', value: 'Europe/London' }
]

const settings = computed(() => settingsStore.settings)

const enabledEnvironments = computed(() => {
  return connectionPairsStore.enabledEnvironments
})

const updateTheme = () => {
  // Theme is automatically updated via watcher in store
}

const updateLanguage = () => {
  setLanguage(settings.value.language)
}

const formatFontSizeKey = (key: string) => {
  const mapping: Record<string, string> = {
    main: 'Global Base',
    menu: 'Nav Menu',
    button: 'Buttons',
    ddlHeader: 'Headers',
    schema: 'Tree',
    ddlName: 'Titles',
    code: 'Code'
  }
  return mapping[key] || key
}

const getFontSizeRange = (key: string) => {
  if (key === 'ddlHeader') return [12,14,16,18,20,22,24,26,28]
  if (key === 'button') return [9,10,11,12,13,14,15]
  return [9,10,11,12,13,14,15,16,17,18,20]
}

const buttonStyles = [
  { id: 'full', label: 'Premium', icon: Zap, desc: 'Rich Gradients' },
  { id: 'minimal', label: 'Minimal', icon: MousePointer2, desc: 'Sleek Lines' },
  { id: 'icons', label: 'Icon Only', icon: Layers, desc: 'Extreme Density' }
]


const showResetModal = ref(false)
const isResetting = ref(false)

const resetToDefaults = () => {
  showResetModal.value = true
}

const confirmResetData = async () => {
  isResetting.value = true
  try {
     if ((window as any).electronAPI && (window as any).electronAPI.andbClearStorage) {
         await (window as any).electronAPI.andbClearStorage()
     } else {
         await new Promise(resolve => setTimeout(resolve, 800))
     }
     
     // Reload app data
     await Promise.all([
       appStore.reloadData(),
       connectionPairsStore.reloadData(),
       operationsStore.clearOperations(),
       operationsStore.loadOperations()
     ])
     
     showResetModal.value = false
  } catch (error: any) {
    if (window.electronAPI) {
      window.electronAPI.log.send('error', 'Failed to reset data in settings', error.message)
    }
    alert('Failed to reset data.')
  } finally {
    isResetting.value = false
  }
}
</script>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb; /* gray-200 */
  border-radius: 9999px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1f2937; /* gray-800 */
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db; /* gray-300 */
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #374151; /* gray-700 */
}
</style>
