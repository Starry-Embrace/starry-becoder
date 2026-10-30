// ==UserScript==
// @name         Starry Becoder
// @namespace    https://becoder.com.cn/
// @version      1.0.52
// @description  Becoder 毛玻璃美化 + 背景图设置 + 运势滚动 + 讨论页面玻璃效果（关闭无需刷新）
// @match        https://becoder.com.cn/*
// @match        https://www.becoder.com.cn/*
// @match        http://222.180.160.110:61235/*
// @icon         https://raw.githubusercontent.com/Starry-Embrace/starry-becoder/refs/heads/main/assets/icon.png
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';


    const DEFAULT_BG = 'https://cdn.luogu.com.cn/upload/image_hosting/ciebmdnk.png';
    const BG_KEY = 'starry_becoder_background';
    const ROLL_KEY = 'starry_becoder_rolling_fortune';
    const CHARS = ['区', '冈', '丒', '凶'];
    const INTERVAL_MS = 200;

    // ============ 背景 ============
    function getBackgroundUrl() {
        return GM_getValue(BG_KEY, '') || DEFAULT_BG;
    }

    function applyBackground(url) {
        const html = document.documentElement;
        html.style.setProperty('background-image', `url("${url}")`, 'important');
        html.style.setProperty('background-size', 'cover', 'important');
        html.style.setProperty('background-position', 'center center', 'important');
        html.style.setProperty('background-attachment', 'fixed', 'important');
        html.style.setProperty('background-repeat', 'no-repeat', 'important');
        html.style.setProperty('background-color', '#142338', 'important');
    }

    // ============ 主题变量 ============
    function applyThemeVariables() {
        const html = document.documentElement;
        html.style.setProperty('--bc-bg', 'transparent', 'important');
        html.style.setProperty('--bc-panel', 'rgba(255, 255, 255, 0.62)', 'important');
        html.style.setProperty('--bc-panel-soft', 'rgba(255, 255, 255, 0.38)', 'important');
        html.style.setProperty('--bc-surface-hover', 'rgba(255, 255, 255, 0.38)', 'important');
    }

    // ============ 强制透明主容器 ============
    const TRANSPARENT_SELECTORS = [
        'body', '#root', '.ant-app', '.ant-layout', '.ant-layout-content',
        '.front-v2-shell', '.front-v2-content',
        '.front-v2-header-inner',
        '.front-home', '.front-home-grid',
        '.front-home-lead-grid', '.front-home-main', '.front-home-side',
        '.site-footer-v2', '.site-footer-bottom'
    ];

    function forceTransparency() {
        let count = 0;
        TRANSPARENT_SELECTORS.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                el.style.setProperty('background', 'transparent', 'important');
                el.style.setProperty('background-color', 'transparent', 'important');
                el.style.setProperty('background-image', 'none', 'important');
                count++;
            });
        });
        return count;
    }

    // 首页专用：让站点布局层透出 html 上的背景图，不清除 html 背景图本身，
    // 也不触碰首页卡片、顶栏或比赛页。
    function applyHomeBackgroundTransparency() {
        if (!(location.pathname === '/' || location.pathname === '/front-v2/home')) return;
        const selectors = ['body', '#root', '.ant-app', '.ant-layout', '.ant-layout-content', '.front-v2-shell', '.front-v2-content'];
        selectors.forEach(selector => document.querySelectorAll(selector).forEach(el => {
            el.style.setProperty('background', 'transparent', 'important');
            el.style.setProperty('background-color', 'transparent', 'important');
            el.style.setProperty('background-image', 'none', 'important');
        }));
    }

    // ============================================================
    //  三层卡片色阶：
    //    - 外层容器（sunny-hero / front-section）：0.42（最深，透出背景）
    //    - 头部 / 中间容器（front-section-head / sunny-hero-board）：0.62（中等）
    //    - 内部小卡片（contest-card-modern / token-chart-panel 等）：0.78（最亮）
    // ============================================================
    // 首页卡片标题栏：只透明化真实存在的 .front-section-head，不改卡片主体。
    function applyHomeSectionHeadTransparency() {
        if (!(location.pathname === '/' || location.pathname === '/front-v2/home')) return;
        document.querySelectorAll('.front-section-head').forEach(head => {
            const set = (property, value) => {
                if (head.style.getPropertyValue(property).trim() !== value ||
                    head.style.getPropertyPriority(property) !== 'important') {
                    head.style.setProperty(property, value, 'important');
                }
            };
            set('background', 'transparent');
            set('background-color', 'transparent');
            set('background-image', 'none');
            set('box-shadow', 'none');
        });
    }

    function applyCardStyles() {
        // ===== 层级 1：外层卡片 0.42 =====
        document.querySelectorAll('.sunny-hero, .front-section').forEach(card => {
            card.style.setProperty('background', 'rgba(20, 35, 56, 0.42)', 'important');
            card.style.setProperty('background-color', 'rgba(20, 35, 56, 0.42)', 'important');
            card.style.removeProperty('background-image');
            card.style.setProperty('backdrop-filter', 'blur(22px) saturate(110%)', 'important');
            card.style.setProperty('-webkit-backdrop-filter', 'blur(22px) saturate(110%)', 'important');
            card.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.35)', 'important');
            card.style.setProperty('border-radius', '14px', 'important');
            card.style.setProperty('box-shadow', '0 8px 28px rgba(0, 0, 0, 0.1)', 'important');
            card.style.setProperty('overflow', 'hidden', 'important');
        });

        // ===== 侧栏卡片：0.55（稍亮，因为不是多层容器） =====
        document.querySelectorAll('.side-panel, .home-developer-plugin, .duel-panel, .home-rating-panel-v2, .wallet-panel, .daily-panel').forEach(card => {
            card.style.setProperty('background', 'rgba(255, 255, 255, 0.55)', 'important');
            card.style.setProperty('background-color', 'rgba(255, 255, 255, 0.55)', 'important');
            card.style.setProperty('background-image', 'none', 'important');
            card.style.setProperty('backdrop-filter', 'blur(22px) saturate(110%)', 'important');
            card.style.setProperty('-webkit-backdrop-filter', 'blur(22px) saturate(110%)', 'important');
            card.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.4)', 'important');
            card.style.setProperty('border-radius', '14px', 'important');
            card.style.setProperty('box-shadow', '0 8px 28px rgba(0, 0, 0, 0.1)', 'important');
            card.style.setProperty('overflow', 'hidden', 'important');
        });

        // ===== 层级 2：头部 + 中间容器 0.62 =====
        // front-section 的头部只保留上方圆角，下边缘与主体直角衔接。
        document.querySelectorAll('.front-section-head, .front-section > .ant-card-head, .front-section .ant-card-head').forEach(head => {
            head.style.setProperty('background', 'transparent', 'important');
            head.style.setProperty('background-color', 'transparent', 'important');
            head.style.setProperty('background-image', 'none', 'important');
            head.style.setProperty('backdrop-filter', 'none', 'important');
            head.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            head.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.3)', 'important');
            head.style.setProperty('border-radius', '10px 10px 0 0', 'important');
            head.style.setProperty('border-bottom-left-radius', '0', 'important');
            head.style.setProperty('border-bottom-right-radius', '0', 'important');
        });

        // sunny-hero-board 维持原来的独立圆角。
        document.querySelectorAll('.sunny-hero-board').forEach(mid => {
            mid.style.setProperty('background', 'rgba(255, 255, 255, 0.62)', 'important');
            mid.style.setProperty('background-color', 'rgba(255, 255, 255, 0.62)', 'important');
            mid.style.setProperty('background-image', 'none', 'important');
            mid.style.setProperty('backdrop-filter', 'none', 'important');
            mid.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            mid.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.3)', 'important');
            mid.style.setProperty('border-radius', '10px', 'important');
        });

        // ===== 层级 3：内部小卡片 0.78 =====
        document.querySelectorAll('.contest-card-modern, .training-plan-item').forEach(sub => {
            sub.style.setProperty('background', 'rgba(255, 255, 255, 0.78)', 'important');
            sub.style.setProperty('background-color', 'rgba(255, 255, 255, 0.78)', 'important');
            sub.style.setProperty('background-image', 'none', 'important');
            sub.style.setProperty('backdrop-filter', 'none', 'important');
            sub.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            sub.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.4)', 'important');
            sub.style.setProperty('border-radius', '10px', 'important');
        });

        // Token 图表融入外层毛玻璃卡片，收紧预设模型栏下方的空隙。
        document.querySelectorAll('.token-chart-panel').forEach(panel => {
            panel.style.setProperty('background', 'rgba(255, 255, 255, 0.22)', 'important');
            panel.style.setProperty('background-color', 'rgba(255, 255, 255, 0.22)', 'important');
            panel.style.setProperty('background-image', 'none', 'important');
            panel.style.setProperty('backdrop-filter', 'blur(14px) saturate(115%)', 'important');
            panel.style.setProperty('-webkit-backdrop-filter', 'blur(14px) saturate(115%)', 'important');
            panel.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.24)', 'important');
            panel.style.setProperty('border-radius', '12px', 'important');
            panel.style.setProperty('margin-top', '0px', 'important');
            panel.style.setProperty('padding', '8px 10px 4px', 'important');
        });

        // 预设模型栏融入 Token 主卡片底部，同时保留内边距避免标签贴边。
        document.querySelectorAll('.token-model-row').forEach(row => {
            row.style.setProperty('background', 'transparent', 'important');
            row.style.setProperty('background-color', 'transparent', 'important');
            row.style.setProperty('background-image', 'none', 'important');
            row.style.setProperty('backdrop-filter', 'none', 'important');
            row.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            row.style.setProperty('border', '0', 'important');
            row.style.setProperty('box-shadow', 'none', 'important');
            row.style.setProperty('border-radius', '0', 'important');
            row.style.setProperty('padding', '14px 10px 14px 24px', 'important');
            row.style.setProperty('margin-left', '0px', 'important');
            row.style.setProperty('width', '100%', 'important');
            row.style.setProperty('box-sizing', 'border-box', 'important');
        });

        // 下拉框本身保留轻微玻璃边界，不出现大块纯白底。
        document.querySelectorAll('.token-model-row .ant-select-selector').forEach(selector => {
            selector.style.setProperty('background', 'rgba(255, 255, 255, 0.16)', 'important');
            selector.style.setProperty('background-color', 'rgba(255, 255, 255, 0.16)', 'important');
            selector.style.setProperty('border-color', 'rgba(255, 255, 255, 0.32)', 'important');
            selector.style.setProperty('box-shadow', 'none', 'important');
        });

        // ===== 卡片内部布局容器：透明（让上层的色透出来） =====
        const transparents = [
            '.sunny-hero-copy',
            '.sunny-hero-actions',
            '.home-quick-strip',
            '.sunny-board-top',
            '.sunny-board-top > div',
            '.sunny-board-top a',
            '.training-plan-list',
            '.training-plan-copy',
            '.token-actions',
            '.token-model',
            '.token-chart-panel svg',
            '.contest-grid',
            '.contest-card-header',
            '.contest-card-body',
            '.contest-card-footer',
            '.contest-badges',
            '.contest-time-row',
            '.front-section-head > *',
            '.front-section-head h2',
        ];
        transparents.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                el.style.setProperty('background', 'transparent', 'important');
                el.style.setProperty('background-color', 'transparent', 'important');
                el.style.setProperty('background-image', 'none', 'important');
                el.style.setProperty('backdrop-filter', 'none', 'important');
                el.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            });
        });

        // 不再批量清除卡片后代的 background-image：部分卡片装饰和题目区背景依赖这些图层。
    }

    // ============ 顶栏 / 搜索框 / 底栏 ============
    function applyHeaderAndFooterStyles() {
        // v1.0.7：站点顶部栏可能因页面/版本不同而没有 front-v2-header 类名，
        // 因此同时覆盖常见的主站顶栏选择器，并用 inline !important 持续压过站点主题色。
        const headers = document.querySelectorAll(
            'header.ant-layout-header.front-v2-header, ' +
            'header.ant-layout-header, header.front-v2-header, ' +
            'header.auth-topbar'
        );
        headers.forEach((header) => {
            header.style.setProperty('background', 'rgba(20, 35, 56, 0.82)', 'important');
            header.style.setProperty('background-color', 'rgba(20, 35, 56, 0.82)', 'important');
            header.style.setProperty('background-image', 'none', 'important');
            header.style.setProperty('-webkit-backdrop-filter', 'blur(16px) saturate(160%)', 'important');
            header.style.setProperty('backdrop-filter', 'blur(16px) saturate(160%)', 'important');
            header.style.setProperty('border-color', 'rgba(255, 255, 255, 0.16)', 'important');
            header.style.setProperty('box-shadow', 'none', 'important');
        });

        // v1.0.11：讨论页面的两个标题栏也通过 inline !important 固定深蓝玻璃，
        // 防止 React 重渲染后恢复站点淡黄色背景。
        document.querySelectorAll(
            '.messages-sidebar-head-v2, .messages-sidebar-header-v2, .messages-main-head-v2'
        ).forEach((head) => {
            head.style.setProperty('background', 'rgba(20, 35, 56, 0.72)', 'important');
            head.style.setProperty('background-color', 'rgba(20, 35, 56, 0.72)', 'important');
            head.style.setProperty('background-image', 'none', 'important');
            head.style.setProperty('backdrop-filter', 'blur(16px) saturate(150%)', 'important');
            head.style.setProperty('-webkit-backdrop-filter', 'blur(16px) saturate(150%)', 'important');
            head.style.setProperty('border-color', 'rgba(255, 255, 255, 0.20)', 'important');
            head.style.setProperty('box-shadow', 'none', 'important');
        });

        // v1.0.11：按按钮文字定位，避免依赖可能变化的标题栏 class 名。
        document.querySelectorAll('button, a, [role="button"], .ant-btn').forEach((node) => {
            const rawLabel = node.innerText || node.getAttribute('aria-label') || node.getAttribute('title') || '';
            const label = rawLabel.replace(/\s+/g, '').trim();
            if (!label) return;
            const isExit = /退出|离开|注销/.test(label);
            const isRefresh = /刷新|重载/.test(label) || /reload|refresh/i.test(node.getAttribute('aria-label') || '');
            const isMember = /成员|成员列表|查看成员/.test(label);
            // 验证码刷新按钮不能套用通用工具按钮的深色主题；原站点验证码按钮应保持浅色。
            if (node.matches('.auth-captcha') || node.closest('.auth-captcha')) return;
            if (!isExit && !isRefresh && !isMember) return;
            const target = node;
            const bg = isExit ? 'rgba(153, 27, 27, 0.90)' : 'rgba(8, 18, 32, 0.88)';
            const border = isExit ? 'rgba(248, 113, 113, 0.95)' : 'rgba(255, 255, 255, 0.34)';
            target.style.setProperty('background', bg, 'important');
            target.style.setProperty('background-color', bg, 'important');
            target.style.setProperty('background-image', 'none', 'important');
            target.style.setProperty('border-color', border, 'important');
            target.style.setProperty('color', '#ffffff', 'important');
            target.style.setProperty('box-shadow', 'none', 'important');
            target.style.setProperty('opacity', '1', 'important');
            target.querySelectorAll('span, .anticon, svg, path').forEach((child) => {
                child.style.setProperty('color', '#ffffff', 'important');
                child.style.setProperty('fill', '#ffffff', 'important');
            });
        });

        const searchWrap = document.querySelector('.front-v2-search');
        if (searchWrap) {
            searchWrap.style.setProperty('background', 'rgba(255, 255, 255, 0.18)', 'important');
            searchWrap.style.setProperty('background-color', 'rgba(255, 255, 255, 0.18)', 'important');
            searchWrap.style.setProperty('border-color', 'rgba(255, 255, 255, 0.28)', 'important');
            searchWrap.style.setProperty('color', 'rgba(255, 255, 255, 0.92)', 'important');
            searchWrap.style.setProperty('box-shadow', 'none', 'important');
            const innerInput = searchWrap.querySelector('input.ant-input');
            if (innerInput) {
                innerInput.style.setProperty('background', 'transparent', 'important');
                innerInput.style.setProperty('background-color', 'transparent', 'important');
                innerInput.style.setProperty('color', 'rgba(255, 255, 255, 0.92)', 'important');
                innerInput.style.setProperty('border', 'none', 'important');
                innerInput.style.setProperty('box-shadow', 'none', 'important');
            }
        }

        const footerV2 = document.querySelector('.site-footer-v2');
        if (footerV2) {
            footerV2.style.setProperty('background', 'transparent', 'important');
            footerV2.style.setProperty('background-color', 'transparent', 'important');
            footerV2.style.setProperty('background-image', 'none', 'important');
            footerV2.style.setProperty('border', 'none', 'important');
        }

        const footerInner = document.querySelector('.site-footer-inner');
        if (footerInner) {
            footerInner.style.setProperty('background-color', 'rgba(20, 35, 56, 0.55)', 'important');
            footerInner.style.setProperty('background-image', 'none', 'important');
            footerInner.style.setProperty('-webkit-backdrop-filter', 'blur(20px) saturate(160%)', 'important');
            footerInner.style.setProperty('backdrop-filter', 'blur(20px) saturate(160%)', 'important');
            footerInner.style.setProperty('color', 'rgba(255, 255, 255, 0.88)', 'important');
            footerInner.style.setProperty('border-radius', '16px', 'important');
            footerInner.style.setProperty('border', 'none', 'important');
            footerInner.style.setProperty('outline', 'none', 'important');
            footerInner.style.setProperty('padding', '16px', 'important');
            footerInner.style.setProperty('box-sizing', 'border-box', 'important');

            footerInner.querySelectorAll('a, p, span, strong, small, .footer-section-title, .footer-link-list, .footer-contact-row, .footer-brand-lockup')
                .forEach(el => {
                    el.style.setProperty('background-color', 'transparent', 'important');
                    el.style.setProperty('background-image', 'none', 'important');
                });
        }

        const footerBottom = document.querySelector('.site-footer-bottom');
        if (footerBottom) {
            footerBottom.style.setProperty('background', 'transparent', 'important');
            footerBottom.style.setProperty('background-color', 'transparent', 'important');
            footerBottom.style.setProperty('background-image', 'none', 'important');
            footerBottom.style.setProperty('border', 'none', 'important');
            footerBottom.style.setProperty('border-top', 'none', 'important');
            footerBottom.style.setProperty('border-bottom', 'none', 'important');
        }
    }

    // ============================================================
    //  向「工具」子菜单注入「更改背景图」，并在上级菜单的「工具」下方放置设置入口
    // ============================================================
    const BG_ITEM_ID = 'starry-menu-bg-item';
    const SETTINGS_ITEM_ID = 'starry-menu-settings-item';

    function isToolSubmenu(ul) {
        if (!ul) return false;
        if (!ul.classList.contains('ant-dropdown-menu')) return false;
        if (!ul.classList.contains('ant-dropdown-menu-sub')) return false;
        const directItems = Array.from(ul.children).filter(li =>
            li.classList && li.classList.contains('ant-dropdown-menu-item')
        );
        if (directItems.length < 2) return false;
        const texts = directItems.map(li => (li.textContent || '').trim());
        return texts.some(t => t.includes('人物')) && texts.some(t => t.includes('帮助'));
    }

    function createBgMenuItem(helpMenuId) {
        const li = document.createElement('li');
        li.id = BG_ITEM_ID;
        li.className = 'ant-dropdown-menu-item front-v2-user-tool-item';
        li.setAttribute('role', 'menuitem');
        li.tabIndex = -1;
        if (helpMenuId) li.setAttribute('data-menu-id', helpMenuId + '-starryBg');

        const icon = document.createElement('span');
        icon.setAttribute('role', 'img');
        icon.setAttribute('aria-label', 'picture');
        icon.className = 'anticon anticon-picture ant-dropdown-menu-item-icon';
        icon.innerHTML = '<svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-40 632H136v-39.9l138.5-164.3 150.1 178L658.1 489 888 761.6V792zm0-129.8L664.2 396.8c-3.2-3.8-9-3.8-12.2 0L424.6 666.4l-144-170.7c-3.2-3.8-9-3.8-12.2 0L136 652.7V232h752v430.2zM304 456a88 88 0 100-176 88 88 0 000 176zm0-116c15.5 0 28 12.5 28 28s-12.5 28-28 28-28-12.5-28-28 12.5-28 28-28z"></path></svg>';

        const content = document.createElement('span');
        content.className = 'ant-dropdown-menu-title-content';
        content.textContent = '背景图设置';

        li.appendChild(icon);
        li.appendChild(content);

        li.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Escape', code: 'Escape', keyCode: 27, which: 27,
                bubbles: true, cancelable: true
            }));
            setTimeout(openSettingsCard, 120);
        });
        return li;
    }

    function createStarrySettingsMenuItem(helpMenuId) {
        const li = document.createElement('li');
        li.id = SETTINGS_ITEM_ID;
        li.className = 'ant-dropdown-menu-item front-v2-user-tool-item';
        li.setAttribute('role', 'menuitem');
        li.tabIndex = -1;
        if (helpMenuId) li.setAttribute('data-menu-id', helpMenuId + '-starrySettings');
        const icon = document.createElement('span');
        icon.className = 'anticon ant-dropdown-menu-item-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M512 64a448 448 0 1 0 0 896 448 448 0 0 0 0-896zm0 96a352 352 0 1 1 0 704 352 352 0 0 1 0-704zm-48 144v208l176 104 48-80-128-76V304z"/></svg>';
        const content = document.createElement('span');
        content.className = 'ant-dropdown-menu-title-content';
        content.textContent = 'Starry Becoder 设置';
        li.append(icon, content);
        li.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', code:'Escape', keyCode:27, which:27, bubbles:true, cancelable:true}));
            setTimeout(openRollingSettingsCard, 120);
        });
        return li;
    }

    function injectIntoSubmenu(ul) {
        if (!ul || !isToolSubmenu(ul)) return false;
        const directItems = Array.from(ul.children).filter(li =>
            li.classList && li.classList.contains('ant-dropdown-menu-item')
        );
        const helpLi = directItems.find(li => (li.textContent || '').includes('帮助'));
        if (!helpLi) return false;

        const menuId = helpLi.getAttribute('data-menu-id') || '';
        if (!ul.querySelector('#' + BG_ITEM_ID)) {
            ul.insertBefore(createBgMenuItem(menuId), helpLi);
            return true;
        }
        return false;
    }

    // 将 Starry Becoder 设置放到上级用户菜单中，紧跟在「工具」入口下面，而不是放进工具子菜单。
    function injectSettingsBelowTool(ul) {
        if (!ul || !ul.classList.contains('ant-dropdown-menu')) return false;
        if (ul.classList.contains('ant-dropdown-menu-sub')) return false;
        if (ul.querySelector('#' + SETTINGS_ITEM_ID)) return false;

        const directItems = Array.from(ul.children).filter(li =>
            li.classList && (li.classList.contains('ant-dropdown-menu-item') || li.classList.contains('ant-dropdown-menu-submenu'))
        );
        const toolLi = directItems.find(li => (li.textContent || '').trim().startsWith('工具'));
        if (!toolLi) return false;

        const item = createStarrySettingsMenuItem(toolLi.getAttribute('data-menu-id') || '');
        item.classList.remove('front-v2-user-tool-item');
        item.classList.add('front-v2-user-settings-item');
        ul.insertBefore(item, toolLi.nextSibling);
        return true;
    }

    function scanAllSubmenus() {
        document.querySelectorAll('ul.ant-dropdown-menu-sub').forEach(ul => injectIntoSubmenu(ul));
        document.querySelectorAll('ul.ant-dropdown-menu:not(.ant-dropdown-menu-sub)').forEach(ul => injectSettingsBelowTool(ul));
    }

    function setupDropdownInjector() {
        let scheduled = false;
        new MutationObserver(() => {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(() => {
                scheduled = false;
                scanAllSubmenus();
            });
        }).observe(document.body, {
            childList: true, subtree: true,
            attributes: true, attributeFilter: ['class', 'style']
        });

        setInterval(scanAllSubmenus, 150);

        document.addEventListener('mouseover', (e) => {
            if (!e.target || !e.target.closest) return;
            const sm = e.target.closest('.ant-dropdown-menu-submenu, .ant-menu-submenu');
            if (sm) {
                [30, 100, 200, 400, 800].forEach(d => setTimeout(scanAllSubmenus, d));
            }
        }, true);
    }

    // ============ CSS ============
    const CSS = `
/* v1.0.21: 强制“显示分类标签”卡片及开关本体使用深色，覆盖站点白底 */
html body.starry-problems-page .problem-filter-actions-v2 .problem-tag-switch-v2,
html body.starry-problems-page .problem-tag-switch-v2 {
  background: rgba(12,25,43,.92) !important;
  background-color: rgba(12,25,43,.92) !important;
  background-image: none !important;
  color: #f4f7fb !important;
  border: 1px solid rgba(255,255,255,.22) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
}
html body.starry-problems-page .problem-tag-switch-v2 .ant-switch,
html body.starry-problems-page .problem-tag-switch-v2 button[role="switch"] {
  appearance: none !important; -webkit-appearance: none !important;
  box-sizing: border-box !important; position: relative !important;
  width: 30px !important; min-width: 30px !important; height: 18px !important;
  padding: 0 !important; border: 1px solid rgba(220,235,255,.35) !important;
  border-radius: 999px !important; background: #5a6e87 !important;
  background-color: #5a6e87 !important; background-image: none !important;
  box-shadow: none !important; overflow: hidden !important;
}
html body.starry-problems-page .problem-tag-switch-v2 .ant-switch.ant-switch-checked,
html body.starry-problems-page .problem-tag-switch-v2 button[role="switch"].ant-switch-checked {
  background: #2185d0 !important; background-color: #2185d0 !important;
}
html body.starry-problems-page .problem-tag-switch-v2 .ant-switch-handle {
  position: absolute !important; top: 2px !important; inset-inline-start: 2px !important;
  width: 12px !important; height: 12px !important; margin: 0 !important;
  border-radius: 50% !important; transform: none !important;
  background: #23364d !important; background-color: #23364d !important;
}
html body.starry-problems-page .problem-tag-switch-v2 .ant-switch-checked .ant-switch-handle {
  inset-inline-start: 14px !important;
}
/* ===== 登录页顶部毛玻璃 ===== */
header.auth-topbar {
    background: rgba(255, 255, 255, 0.18) !important;
    background-color: rgba(255, 255, 255, 0.18) !important;
    background-image: none !important;
    -webkit-backdrop-filter: blur(16px) saturate(150%) !important;
    backdrop-filter: blur(16px) saturate(150%) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.25) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06) !important;
}

/* ===== 登录页 Becoder 品牌文字：白色 ===== */
header.auth-topbar .auth-brand > span > strong {
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff !important;
}

/* ===== 登录页顶部链接 ===== */
header.auth-topbar .auth-home-link {
    color: rgba(255, 255, 255, 0.92) !important;
}

/* ===== 登录页底部毛玻璃 ===== */
footer.auth-footer-v2 {
    background: rgba(255, 255, 255, 0.16) !important;
    background-color: rgba(255, 255, 255, 0.16) !important;
    background-image: none !important;
    -webkit-backdrop-filter: blur(16px) saturate(150%) !important;
    backdrop-filter: blur(16px) saturate(150%) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.25) !important;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05) !important;
}
/* ===== 顶栏菜单文字 ===== */
.ant-menu.ant-menu-light,
.ant-menu-light > .ant-menu,
.ant-menu-horizontal,
.ant-menu-overflow {
    background: transparent !important;
}

.ant-menu-light .ant-menu-item,
.ant-menu-light .ant-menu-submenu-title,
.ant-menu-light .ant-menu-title-content a,
.front-v2-brand-name,
.front-v2-user-name,
.front-v2-actions .anticon {
    color: rgba(255, 255, 255, 0.92) !important;
}

/* ===== 品牌名 Becoder：强制白色，覆盖站点原有黑色样式 ===== */
a.front-v2-brand .front-v2-brand-name {
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff !important;
}

.ant-menu-light .ant-menu-item-selected,
.ant-menu-light .ant-menu-item:hover,
.ant-menu-light .ant-menu-submenu-title:hover {
    color: #ffffff !important;
}

.ant-menu-light .ant-menu-item-selected::after {
    border-bottom-color: #ffffff !important;
}

.front-v2-actions .ant-btn-variant-outlined,
.front-v2-actions .ant-btn-variant-text {
    background: rgba(10, 31, 77, 0.78) !important;
    background-color: rgba(10, 31, 77, 0.78) !important;
    border-color: rgba(78, 112, 178, 0.62) !important;
    color: rgba(255, 255, 255, 0.92) !important;
}

.front-v2-actions .ant-btn-variant-outlined:hover,
.front-v2-actions .ant-btn-variant-text:hover,
.front-v2-actions .ant-btn-variant-outlined:focus-visible,
.front-v2-actions .ant-btn-variant-text:focus-visible {
    background: #0b1f4d !important;
    background-color: #0b1f4d !important;
    border-color: #274a85 !important;
    color: rgba(255, 255, 255, 0.98) !important;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08) !important;
}

/* ==========================================================
 * 三层色阶：0.42 / 0.62 / 0.78
 * ========================================================== */

/* 外层容器：0.42（最深） */
.front-section,
.sunny-hero {
    background: rgba(20, 35, 56, 0.42) !important;
    backdrop-filter: blur(22px) saturate(110%) !important;
    -webkit-backdrop-filter: blur(22px) saturate(110%) !important;
    border: 1px solid rgba(255, 255, 255, 0.35) !important;
    border-radius: 14px !important;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1) !important;
}

/* 侧栏卡片：0.55 */
.side-panel,
.home-developer-plugin,
.duel-panel,
.home-rating-panel-v2,
.wallet-panel,
.daily-panel {
    background: rgba(255, 255, 255, 0.55) !important;
    backdrop-filter: blur(22px) saturate(110%) !important;
    -webkit-backdrop-filter: blur(22px) saturate(110%) !important;
    border: 1px solid rgba(255, 255, 255, 0.4) !important;
    border-radius: 14px !important;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1) !important;
    overflow: hidden !important;
}

/* front-section 头部：只保留上方圆角，下边缘保持直角 */
.front-section-head {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 10px 10px 0 0 !important;
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}

/* v1.0.49：首页只透明化卡片标题栏，不改卡片主体背景。 */
.front-section > .ant-card-head,
.front-section .ant-card-head,
.front-section-head {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
}
.front-section > .ant-card-head .ant-card-head-title,
.front-section .ant-card-head .ant-card-head-title {
    background: transparent !important;
    background-color: transparent !important;
}

/* 中间容器保持独立圆角 */
.sunny-hero-board {
    background: rgba(255, 255, 255, 0.62) !important;
    background-color: rgba(255, 255, 255, 0.62) !important;
    background-image: none !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 10px !important;
}

/* 内部小卡片 */
.contest-card-modern,
.training-plan-item {
    background: rgba(255, 255, 255, 0.78) !important;
    background-color: rgba(255, 255, 255, 0.78) !important;
    background-image: none !important;
    border: 1px solid rgba(255, 255, 255, 0.4) !important;
    border-radius: 10px !important;
}

/* Token 图表：毛玻璃化并收紧顶部间距，避免预设模型栏移除白框后留下大空隙 */
.token-chart-panel {
    background: rgba(255, 255, 255, 0.22) !important;
    background-color: rgba(255, 255, 255, 0.22) !important;
    background-image: none !important;
    backdrop-filter: blur(14px) saturate(115%) !important;
    -webkit-backdrop-filter: blur(14px) saturate(115%) !important;
    border: 1px solid rgba(255, 255, 255, 0.24) !important;
    border-radius: 12px !important;
    margin-top: 0 !important;
    padding: 8px 10px 4px !important;
}

/* 预设模型栏融入 Token 主卡片，保留左右内边距 */
.token-model-row {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 14px 10px 14px 24px !important;
    margin-left: 0 !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

.token-model-row .ant-select-selector {
    background: rgba(255, 255, 255, 0.16) !important;
    background-color: rgba(255, 255, 255, 0.16) !important;
    border-color: rgba(255, 255, 255, 0.32) !important;
    box-shadow: none !important;
}

/* ==========================================================
 * 卡片内部布局容器：透明（跟随上层色）
 * ========================================================== */
.front-section-head > *,
.front-section-head h2,
.sunny-hero-copy,
.sunny-hero-actions,
.home-quick-strip,
.sunny-board-top,
.sunny-board-top > div,
.sunny-board-top a,
.training-plan-list,
.training-plan-copy,
.token-actions,
.token-model,
.token-chart-panel svg,
.contest-grid,
.contest-card-header,
.contest-card-body,
.contest-card-footer,
.contest-badges,
.contest-time-row,
.side-panel-head,
.home-rating-head-v2,
.home-rating-title-v2,
.home-rating-summary-v2,
.home-rating-metrics-v2,
.home-rating-latest-v2,
.home-rating-graph-v2,
.wallet-item,
.countdown-item,
.group-item,
.checkin-week,
.checkin-actions,
.fortune-grid,
.daily-checkin-head,
.side-divider {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}

/* 不对卡片及其全部后代统一清除背景图；保留站点原有装饰图层。 */
.sunny-hero::before, .sunny-hero::after,
.sunny-hero-copy::before, .sunny-hero-copy::after,
.sunny-hero-board::before, .sunny-hero-board::after,
.training-plan-board::before, .training-plan-board::after,
.front-section::before, .front-section::after,
.front-section-head::before, .front-section-head::after,
.sunny-board-top::before, .sunny-board-top::after {
    /* 保留站点伪元素，避免误删卡片装饰和背景图层。 */
}

/* ===== hover ===== */
.contest-card-modern:hover,
.side-panel:hover {
    background: rgba(255, 255, 255, 0.88) !important;
    box-shadow: 0 10px 32px rgba(0, 0, 0, 0.14) !important;
    transition: background 0.2s, box-shadow 0.2s !important;
}

/* ===== 底栏布局 ===== */
.site-footer-inner {
    display: grid !important;
    grid-template-columns: minmax(260px, 2fr) repeat(3, minmax(140px, 1fr)) !important;
    gap: 16px !important;
    align-items: stretch !important;
    box-sizing: border-box !important;
    padding: 16px !important;
    border: none !important;
    outline: none !important;
}

.site-footer-inner .footer-brand-block,
.site-footer-inner .footer-link-group {
    background-color: rgba(255, 255, 255, 0.08) !important;
    background-image: none !important;
    border: 1px solid rgba(255, 255, 255, 0.14) !important;
    border-radius: 12px !important;
    padding: 18px 20px !important;
    box-sizing: border-box !important;
    min-width: 0 !important;
    backdrop-filter: blur(6px) saturate(140%) !important;
    -webkit-backdrop-filter: blur(6px) saturate(140%) !important;
    transition: background 0.2s, border-color 0.2s !important;
}

.site-footer-inner .footer-brand-block:hover,
.site-footer-inner .footer-link-group:hover {
    background-color: rgba(255, 255, 255, 0.12) !important;
    border-color: rgba(255, 255, 255, 0.24) !important;
}

.footer-brand-block p,
.footer-brand-block .footer-contact-row a,
.footer-brand-lockup strong,
.footer-brand-lockup small,
.footer-section-title,
.footer-link-list a,
.footer-link-list span {
    color: rgba(255, 255, 255, 0.85) !important;
}

.footer-link-list a:hover,
.footer-contact-row a:hover {
    color: #ffffff !important;
}

.footer-brand-block .footer-brand-mark {
    color: #ffffff !important;
    background-color: rgba(255, 255, 255, 0.15) !important;
}

.footer-section-title {
    font-weight: 600 !important;
    opacity: 0.92 !important;
}

.site-footer-bottom {
    background-color: transparent !important;
    border: none !important;
    border-top: none !important;
    border-bottom: none !important;
    padding-top: 8px !important;
}

.site-footer-bottom,
.site-footer-bottom a,
.site-footer-bottom span {
    color: rgba(255, 255, 255, 0.75) !important;
}

/* ===== 通用输入框 ===== */
.ant-input,
.ant-input-outlined,
.ant-input-affix-wrapper {
    background: rgba(255, 255, 255, 0.7) !important;
    border-color: rgba(140, 160, 185, 0.4) !important;
}

.ant-input:focus,
.ant-input-outlined:focus,
.ant-input-outlined:focus-within,
.ant-input-affix-wrapper:focus,
.ant-input-affix-wrapper-focused {
    background: rgba(255, 255, 255, 0.9) !important;
    border-color: rgba(33, 133, 208, 0.8) !important;
    box-shadow: 0 0 0 3px rgba(33, 133, 208, 0.18) !important;
}

/* ===== 通用按钮 ===== */
.ant-btn-variant-outlined {
    background: rgba(255, 255, 255, 0.6) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    border-color: rgba(140, 160, 185, 0.4) !important;
}

.ant-btn-variant-outlined:hover {
    background: rgba(255, 255, 255, 0.85) !important;
}

/* ===== 下拉菜单 ===== */
.ant-dropdown .ant-dropdown-menu,
.ant-dropdown-menu-sub,
.ant-select-dropdown,
.ant-popover .ant-popover-inner,
.ant-tooltip .ant-tooltip-inner {
    background: rgba(255, 255, 255, 0.92) !important;
    backdrop-filter: blur(20px) saturate(140%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(140%) !important;
    border: 1px solid rgba(255, 255, 255, 0.4) !important;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12) !important;
}

.ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item,
.ant-dropdown-menu-sub .ant-dropdown-menu-item {
    color: rgba(28, 32, 38, 0.92) !important;
    border-radius: 6px !important;
}

.ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item:hover,
.ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item-active,
.ant-dropdown-menu-sub .ant-dropdown-menu-item:hover,
.ant-dropdown-menu-sub .ant-dropdown-menu-item-active {
    background: rgba(33, 133, 208, 0.12) !important;
    color: rgba(33, 133, 208, 0.96) !important;
}

/* ===== 设置卡片 ===== */
#starry-settings-mask,
#starry-toggle-mask {
    position: fixed;
    inset: 0;
    z-index: 2147483000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(20, 35, 56, 0.42);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.22s ease;
}

#starry-settings-mask.show,
#starry-toggle-mask.show {
    opacity: 1;
    pointer-events: auto;
}

#starry-settings-card,
#starry-toggle-card {
    width: 460px;
    max-width: calc(100vw - 32px);
    box-sizing: border-box;
    padding: 22px 26px 20px;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(24px) saturate(140%);
    -webkit-backdrop-filter: blur(24px) saturate(140%);
    border: 1px solid rgba(255, 255, 255, 0.55);
    border-radius: 14px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.22);
    color: rgba(28, 32, 38, 0.94);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
                 "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    font-size: 14px;
    transform: translateY(10px) scale(0.98);
    transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

#starry-settings-mask.show #starry-settings-card,
#starry-toggle-mask.show #starry-toggle-card {
    transform: translateY(0) scale(1);
}

#starry-settings-card h3,
#starry-toggle-card h3 {
    margin: 0 0 6px;
    font-size: 17px;
    font-weight: 600;
    color: rgba(20, 24, 30, 0.96);
}

#starry-settings-card .starry-desc,
#starry-toggle-card .starry-desc {
    margin: 0 0 16px;
    font-size: 12.5px;
    color: rgba(60, 66, 74, 0.78);
    line-height: 1.5;
}

#starry-settings-card .starry-field-label {
    display: block;
    margin-bottom: 6px;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(45, 50, 58, 0.85);
}

#starry-bg-url {
    width: 100%;
    box-sizing: border-box;
    padding: 9px 12px;
    font-size: 13px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    color: rgba(28, 32, 38, 0.94);
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid rgba(140, 160, 185, 0.45);
    border-radius: 8px;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
}

#starry-bg-url:focus {
    border-color: rgba(33, 133, 208, 0.9);
    box-shadow: 0 0 0 3px rgba(33, 133, 208, 0.18);
}

#starry-settings-card .starry-actions,
#starry-toggle-card .starry-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

#starry-settings-card .starry-btn,
#starry-toggle-card .starry-btn {
    padding: 8px 16px;
    font-size: 13px;
    font-family: inherit;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: transform 0.12s, background 0.18s, box-shadow 0.18s;
}

#starry-settings-card .starry-btn:active,
#starry-toggle-card .starry-btn:active {
    transform: scale(0.97);
}

#starry-settings-card .starry-btn.ghost,
#starry-toggle-card .starry-btn.ghost {
    background: rgba(255, 255, 255, 0.5);
    color: rgba(45, 50, 58, 0.88);
    border: 1px solid rgba(140, 160, 185, 0.35);
}

#starry-settings-card .starry-btn.ghost:hover,
#starry-toggle-card .starry-btn.ghost:hover {
    background: rgba(255, 255, 255, 0.72);
}

#starry-settings-card .starry-btn.primary,
#starry-toggle-card .starry-btn.primary {
    background: linear-gradient(180deg, #2185d0, #1a6eb0);
    color: #fff;
    box-shadow: 0 4px 12px rgba(33, 133, 208, 0.35);
}

#starry-settings-card .starry-btn.primary:hover,
#starry-toggle-card .starry-btn.primary:hover {
    background: linear-gradient(180deg, #3a98e0, #2a7ac0);
}

#starry-toggle-card .starry-toggle-row { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 0; color:rgba(35,40,48,.92); font-size:14px; }
#starry-rolling-toggle { width:18px; height:18px; accent-color:#2185d0; cursor:pointer; }

/* ===== 顶栏搜索框 ===== */
.front-v2-search,
.front-v2-search.ant-input-affix-wrapper,
.front-v2-search.ant-input-outlined,
.front-v2-search.ant-input-affix-wrapper:hover,
.front-v2-search.ant-input-affix-wrapper:focus,
.front-v2-search.ant-input-affix-wrapper:focus-within,
.front-v2-search.ant-input-affix-wrapper-focused,
.front-v2-search.ant-input-outlined:focus,
.front-v2-search.ant-input-outlined:focus-within {
    background: rgba(255, 255, 255, 0.18) !important;
    background-color: rgba(255, 255, 255, 0.18) !important;
    border-color: rgba(255, 255, 255, 0.28) !important;
    color: rgba(255, 255, 255, 0.92) !important;
    box-shadow: none !important;
}

.front-v2-search input.ant-input,
.front-v2-search .ant-input {
    background: transparent !important;
    background-color: transparent !important;
    color: rgba(255, 255, 255, 0.92) !important;
    border: none !important;
    box-shadow: none !important;
}

.front-v2-search input.ant-input::placeholder,
.front-v2-search .ant-input::placeholder {
    color: rgba(255, 255, 255, 0.55) !important;
}

.front-v2-search .anticon {
    color: rgba(255, 255, 255, 0.75) !important;
}

@media (max-width: 900px) {
    .site-footer-inner {
        grid-template-columns: 1fr 1fr !important;
    }
}

@media (max-width: 560px) {
    .site-footer-inner {
        grid-template-columns: 1fr !important;
    }
}

/* ===== 右上角三个按钮：默认毛玻璃，悬停深蓝 ===== */
.front-v2-actions .ant-btn,
.front-v2-actions button,
.front-v2-actions [role="button"],
.front-v2-auth-slot > button.front-v2-user-button,
button.ant-btn.front-v2-user-button {
    background: rgba(255, 255, 255, 0.16) !important;
    background-color: rgba(255, 255, 255, 0.16) !important;
    background-image: none !important;
    -webkit-backdrop-filter: blur(14px) saturate(160%) !important;
    backdrop-filter: blur(14px) saturate(160%) !important;
    border: 1px solid rgba(255, 255, 255, 0.30) !important;
    border-radius: 10px !important;
    color: #ffffff !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 14px rgba(0,0,0,0.08) !important;
    filter: none !important;
    transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease !important;
}
.front-v2-actions .ant-btn:hover,
.front-v2-actions button:hover,
.front-v2-actions [role="button"]:hover,
.front-v2-auth-slot > button.front-v2-user-button:hover,
button.ant-btn.front-v2-user-button:hover,
.front-v2-actions .ant-btn:focus-visible,
.front-v2-actions button:focus-visible,
.front-v2-actions [role="button"]:focus-visible,
.front-v2-auth-slot > button.front-v2-user-button:focus-visible {
    background: rgba(11, 31, 77, 0.88) !important;
    background-color: rgba(11, 31, 77, 0.88) !important;
    background-image: none !important;
    -webkit-backdrop-filter: blur(14px) saturate(160%) !important;
    backdrop-filter: blur(14px) saturate(160%) !important;
    border-color: rgba(100, 155, 245, 0.72) !important;
    color: #ffffff !important;
    box-shadow: inset 0 0 0 1px rgba(75, 125, 210, 0.24), 0 4px 14px rgba(0,0,0,0.12) !important;
    filter: none !important;
}
.front-v2-actions .ant-btn *,
.front-v2-actions button *,
.front-v2-actions [role="button"] *,
button.front-v2-user-button .front-v2-user-name,
button.front-v2-user-button .ant-avatar,
button.front-v2-user-button > span {
    color: #ffffff !important;
}


/* ==========================================================
 * Starry Becoder：讨论 / 私信页面玻璃效果
 * 仅调整右侧聊天区域，不改左侧消息列表
 * ========================================================== */

/* 右侧主聊天容器：透明玻璃 */
html body .messages-main-v2 {
    background: rgba(255, 255, 255, 0.12) !important;
    background-color: rgba(255, 255, 255, 0.12) !important;
    background-image: none !important;
    -webkit-backdrop-filter: blur(18px) saturate(150%) !important;
    backdrop-filter: blur(18px) saturate(150%) !important;
}

/* 聊天外层：不叠加不必要的背景 */
html body .messages-chat-v2 {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
}

/* 消息内容区：移除原有的不透明渐变 */
html body .messages-body-v2 {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
}

/* 消息气泡：轻微半透明玻璃 */
html body .messages-bubble-v2 {
    background: rgba(255, 255, 255, 0.30) !important;
    background-color: rgba(255, 255, 255, 0.30) !important;
    background-image: none !important;
    -webkit-backdrop-filter: blur(12px) saturate(140%) !important;
    backdrop-filter: blur(12px) saturate(140%) !important;
    border-color: rgba(255, 255, 255, 0.30) !important;
}

/* 聊天标题栏：轻透玻璃 */
html body .messages-main-head-v2 {
    background: rgba(255, 255, 255, 0.18) !important;
    background-color: rgba(255, 255, 255, 0.18) !important;
    background-image: none !important;
    -webkit-backdrop-filter: blur(14px) saturate(150%) !important;
    backdrop-filter: blur(14px) saturate(150%) !important;
    border-color: rgba(255, 255, 255, 0.24) !important;
}

/* 输入区域外壳：修复原来的纯白背景 */
html body .messages-composer-v2 {
    background: rgba(255, 255, 255, 0.12) !important;
    background-color: rgba(255, 255, 255, 0.12) !important;
    background-image: none !important;
    border-color: rgba(255, 255, 255, 0.32) !important;
    box-shadow: none !important;
    -webkit-backdrop-filter: blur(18px) saturate(150%) !important;
    backdrop-filter: blur(18px) saturate(150%) !important;
}

/* 输入框内层：保持透明 */
html body .messages-composer-box-v2 {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
}

/* 输入框本身：半透明背景与柔和边框 */
html body .messages-composer-v2 textarea.ant-input {
    background: rgba(255, 255, 255, 0.12) !important;
    background-color: rgba(255, 255, 255, 0.12) !important;
    background-image: none !important;
    border-color: rgba(255, 255, 255, 0.38) !important;
    box-shadow: none !important;
}

/* 输入框聚焦时：保留轻微高亮，不恢复纯白底 */
html body .messages-composer-v2 textarea.ant-input:focus {
    background: rgba(255, 255, 255, 0.18) !important;
    background-color: rgba(255, 255, 255, 0.18) !important;
    border-color: rgba(255, 255, 255, 0.55) !important;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.10) !important;
}

/* 聊天标题栏按钮：默认半透明 */
html body .messages-main-head-v2 button.ant-btn {
    /* 刷新、成员、退出等操作按钮：压低浅色底，避免在深色标题栏上泛白 */
    background: rgba(8, 18, 32, 0.42) !important;
    background-color: rgba(8, 18, 32, 0.42) !important;
    background-image: none !important;
    color: rgba(255, 255, 255, 0.92) !important;
    border-color: rgba(255, 255, 255, 0.22) !important;
    box-shadow: none !important;
    -webkit-backdrop-filter: blur(10px) !important;
    backdrop-filter: blur(10px) !important;
}
html body .messages-main-head-v2 button.ant-btn span,
html body .messages-main-head-v2 button.ant-btn .anticon,
html body .messages-main-head-v2 button.ant-btn svg {
    color: rgba(255, 255, 255, 0.92) !important;
    fill: currentColor !important;
}
html body .messages-main-head-v2 button.ant-btn:hover,
html body .messages-main-head-v2 button.ant-btn:focus-visible {
    background: rgba(255, 255, 255, 0.12) !important;
    background-color: rgba(255, 255, 255, 0.12) !important;
    border-color: rgba(255, 255, 255, 0.34) !important;
    color: #fff !important;
}
html body .messages-main-head-v2 button.ant-btn:active {
    background: rgba(255, 255, 255, 0.08) !important;
    background-color: rgba(255, 255, 255, 0.08) !important;
}



/* ===== v1.0.9 修复：讨论页面标题栏与操作按钮对比度 ===== */
/* 左侧“消息中心”标题栏和右侧聊天标题栏统一为深蓝半透明玻璃。
   同时覆盖内部包装层、常见 Ant Design 头部和伪元素，避免黄色背景从子层透出。 */
html body .messages-sidebar-head-v2,
html body .messages-sidebar-header-v2,
html body .messages-main-head-v2,
html body .messages-main-v2 > .messages-header-v2,
html body .messages-main-v2 > header,
html body .messages-sidebar-v2 > .messages-sidebar-head-v2 {
    background: rgba(20, 35, 56, 0.72) !important;
    background-color: rgba(20, 35, 56, 0.72) !important;
    background-image: none !important;
    -webkit-backdrop-filter: blur(16px) saturate(150%) !important;
    backdrop-filter: blur(16px) saturate(150%) !important;
    border-color: rgba(255, 255, 255, 0.20) !important;
    box-shadow: none !important;
}
html body .messages-sidebar-head-v2::before,
html body .messages-sidebar-head-v2::after,
html body .messages-sidebar-header-v2::before,
html body .messages-sidebar-header-v2::after,
html body .messages-main-head-v2::before,
html body .messages-main-head-v2::after {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
}
html body .messages-sidebar-head-v2 *,
html body .messages-sidebar-header-v2 *,
html body .messages-main-head-v2 * {
    background-image: none !important;
}
html body .messages-sidebar-head-v2,
html body .messages-sidebar-head-v2 *,
html body .messages-sidebar-header-v2,
html body .messages-sidebar-header-v2 * {
    color: rgba(255, 255, 255, 0.94) !important;
}
html body .messages-main-head-v2,
html body .messages-main-head-v2 * {
    color: rgba(255, 255, 255, 0.94) !important;
}

/* ===== v1.0.7 修复：统一主站/登录页顶部栏，强制深色玻璃，清除淡黄色底色 ===== */
html body header.ant-layout-header,
html body header.front-v2-header,
html body header.auth-topbar,
html body .front-v2-header {
    background: rgba(20, 35, 56, 0.82) !important;
    background-color: rgba(20, 35, 56, 0.82) !important;
    background-image: none !important;
    -webkit-backdrop-filter: blur(16px) saturate(160%) !important;
    backdrop-filter: blur(16px) saturate(160%) !important;
    border-color: rgba(255, 255, 255, 0.16) !important;
    box-shadow: none !important;
}
html body header.ant-layout-header::before,
html body header.ant-layout-header::after,
html body header.front-v2-header::before,
html body header.front-v2-header::after,
html body header.auth-topbar::before,
html body header.auth-topbar::after,
html body .front-v2-header::before,
html body .front-v2-header::after {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
}
html body header.ant-layout-header .front-v2-header-inner,
html body header.front-v2-header .front-v2-header-inner,
html body .front-v2-header .front-v2-header-inner {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
}


/* ===== v1.0.10：根据页面截图，广泛覆盖聊天标题栏右侧操作按钮 =====
   旧规则只命中 button.ant-btn；这里同时覆盖 button、role=button、Ant Design 按钮和常见包装层。 */
html body .messages-main-head-v2 button,
html body .messages-main-head-v2 [role="button"],
html body .messages-main-head-v2 .ant-btn,
html body .messages-main-head-v2 .ant-btn-default,
html body .messages-main-head-v2 .ant-btn-primary,
html body .messages-main-head-v2 .ant-btn-background-ghost,
html body .messages-main-head-v2 .ant-dropdown-trigger,
html body .messages-main-head-v2 .ant-space-item > button,
html body .messages-main-head-v2 > * button {
    background: rgba(8, 18, 32, 0.78) !important;
    background-color: rgba(8, 18, 32, 0.78) !important;
    background-image: none !important;
    color: rgba(255, 255, 255, 0.96) !important;
    border: 1px solid rgba(255, 255, 255, 0.30) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    backdrop-filter: blur(10px) !important;
    opacity: 1 !important;
}
html body .messages-main-head-v2 button *,
html body .messages-main-head-v2 [role="button"] *,
html body .messages-main-head-v2 .ant-btn *,
html body .messages-main-head-v2 .ant-dropdown-trigger * {
    color: rgba(255, 255, 255, 0.96) !important;
    fill: currentColor !important;
    opacity: 1 !important;
}
html body .messages-main-head-v2 button:hover,
html body .messages-main-head-v2 [role="button"]:hover,
html body .messages-main-head-v2 .ant-btn:hover,
html body .messages-main-head-v2 .ant-dropdown-trigger:hover {
    background: rgba(35, 58, 84, 0.94) !important;
    background-color: rgba(35, 58, 84, 0.94) !important;
    border-color: rgba(255, 255, 255, 0.48) !important;
}

    `;

    // ============ 注入 CSS ============
    function injectCSS() {
        // v1.0.20：修复站点/Ant Design 覆盖开关白底，以及滑块垂直偏移。
        const switchFixCSS = `
          body.starry-problems-page .problem-filter-actions-v2 button[role="switch"],
          body.starry-problems-page .problem-filter-actions-v2 .ant-switch,
          body.starry-problems-page .problem-tag-switch-v2 button[role="switch"],
          body.starry-problems-page .problem-tag-switch-v2 .ant-switch {
            appearance: none !important;
            -webkit-appearance: none !important;
            position: relative !important;
            box-sizing: border-box !important;
            width: 30px !important;
            min-width: 30px !important;
            height: 18px !important;
            min-height: 18px !important;
            padding: 0 !important;
            border: 1px solid rgba(220,235,255,.35) !important;
            border-radius: 999px !important;
            background: #5a6e87 !important;
            background-color: #5a6e87 !important;
            background-image: none !important;
            box-shadow: none !important;
            overflow: hidden !important;
            vertical-align: middle !important;
          }
          body.starry-problems-page .problem-filter-actions-v2 button[role="switch"].ant-switch-checked,
          body.starry-problems-page .problem-filter-actions-v2 .ant-switch-checked,
          body.starry-problems-page .problem-tag-switch-v2 button[role="switch"].ant-switch-checked,
          body.starry-problems-page .problem-tag-switch-v2 .ant-switch-checked {
            background: #2185d0 !important;
            background-color: #2185d0 !important;
          }
          body.starry-problems-page .problem-filter-actions-v2 button[role="switch"] .ant-switch-handle,
          body.starry-problems-page .problem-filter-actions-v2 .ant-switch .ant-switch-handle,
          body.starry-problems-page .problem-tag-switch-v2 button[role="switch"] .ant-switch-handle,
          body.starry-problems-page .problem-tag-switch-v2 .ant-switch .ant-switch-handle {
            position: absolute !important;
            top: 2px !important;
            inset-inline-start: 2px !important;
            width: 12px !important;
            height: 12px !important;
            margin: 0 !important;
            border-radius: 50% !important;
            transform: none !important;
            transition: inset-inline-start .2s ease !important;
            background: #23364d !important;
            background-color: #23364d !important;
            box-shadow: none !important;
          }
          body.starry-problems-page .problem-filter-actions-v2 button[role="switch"].ant-switch-checked .ant-switch-handle,
          body.starry-problems-page .problem-filter-actions-v2 .ant-switch-checked .ant-switch-handle,
          body.starry-problems-page .problem-tag-switch-v2 button[role="switch"].ant-switch-checked .ant-switch-handle,
          body.starry-problems-page .problem-tag-switch-v2 .ant-switch-checked .ant-switch-handle {
            inset-inline-start: 14px !important;
          }
          body.starry-problems-page .problem-filter-actions-v2 .ant-switch-handle::before,
          body.starry-problems-page .problem-tag-switch-v2 .ant-switch-handle::before {
            display: none !important;
          }
        `;
        try {
            GM_addStyle(CSS + switchFixCSS);
        } catch (e) {
            console.warn('[Starry Becoder] GM_addStyle 失败:', e);
        }
        try {
            if (!document.getElementById('starry-becoder-style')) {
                const style = document.createElement('style');
                style.id = 'starry-becoder-style';
                style.textContent = CSS + switchFixCSS;
                (document.head || document.documentElement).appendChild(style);
            }
        } catch (e) {
            console.error('[Starry Becoder] <style> 标签注入失败:', e);
        }
    }

    // ============ 设置卡片 ============
    let maskEl = null;

    function buildSettingsCard() {
        if (maskEl) return maskEl;
        maskEl = document.createElement('div');
        maskEl.id = 'starry-settings-mask';
        maskEl.innerHTML = `
            <div id="starry-settings-card" role="dialog" aria-modal="true" aria-label="背景图设置">
                <h3>背景图设置</h3>
                <p class="starry-desc">填写背景图片的直链 URL。留空并保存将恢复为默认背景。</p>
                <label class="starry-field-label" for="starry-bg-url">背景图 URL</label>
                <input id="starry-bg-url" type="text" spellcheck="false" placeholder="${DEFAULT_BG}">
                <div class="starry-actions">
                    <button type="button" class="starry-btn ghost" data-action="reset">恢复默认</button>
                    <button type="button" class="starry-btn ghost" data-action="cancel">取消</button>
                    <button type="button" class="starry-btn primary" data-action="save">保存</button>
                </div>
            </div>
        `;
        maskEl.addEventListener('click', (e) => {
            if (e.target === maskEl) closeSettingsCard();
        });
        maskEl.querySelector('[data-action="cancel"]').addEventListener('click', closeSettingsCard);
        maskEl.querySelector('[data-action="reset"]').addEventListener('click', () => {
            GM_setValue(BG_KEY, '');
            applyBackground(DEFAULT_BG);
            refreshStyles();
            const input = maskEl.querySelector('#starry-bg-url');
            if (input) input.value = DEFAULT_BG;
            closeSettingsCard();
        });
        maskEl.querySelector('[data-action="save"]').addEventListener('click', () => {
            const input = maskEl.querySelector('#starry-bg-url');
            const url = (input?.value || '').trim();
            if (!url) {
                GM_setValue(BG_KEY, '');
                applyBackground(DEFAULT_BG);
                refreshStyles();
            } else {
                GM_setValue(BG_KEY, url);
                applyBackground(url);
                refreshStyles();
            }
            closeSettingsCard();
        });
        maskEl.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { e.stopPropagation(); closeSettingsCard(); }
        });
        document.body.appendChild(maskEl);
        return maskEl;
    }

    function openSettingsCard() {
        const el = buildSettingsCard();
        const input = el.querySelector('#starry-bg-url');
        if (input) input.value = GM_getValue(BG_KEY, '') || DEFAULT_BG;
        void el.offsetWidth;
        el.classList.add('show');
        setTimeout(() => input && input.focus(), 80);
    }

    function closeSettingsCard() {
        if (!maskEl) return;
        maskEl.classList.remove('show');
    }

    // ============ Starry Becoder 设置：控制「滚动的区」开关 ============
    let rollingMaskEl = null;

    function buildRollingSettingsCard() {
        if (rollingMaskEl) return rollingMaskEl;
        rollingMaskEl = document.createElement('div');
        rollingMaskEl.id = 'starry-toggle-mask';
        rollingMaskEl.innerHTML = `
            <div id="starry-toggle-card" role="dialog" aria-modal="true" aria-label="Starry Becoder 设置">
                <h3>Starry Becoder 设置</h3>
                <p class="starry-desc">设置是否启用页面上的“滚动的区”效果。</p>
                <label class="starry-toggle-row" for="starry-rolling-toggle">
                    <span>打开/关闭滚动的区</span>
                    <input id="starry-rolling-toggle" type="checkbox">
                </label>
                <div class="starry-actions">
                    <button type="button" class="starry-btn ghost" data-action="toggle-cancel">取消</button>
                    <button type="button" class="starry-btn primary" data-action="toggle-save">保存</button>
                </div>
            </div>`;
        rollingMaskEl.addEventListener('click', e => { if (e.target === rollingMaskEl) closeRollingSettingsCard(); });
        rollingMaskEl.querySelector('[data-action="toggle-cancel"]').addEventListener('click', closeRollingSettingsCard);
        rollingMaskEl.querySelector('[data-action="toggle-save"]').addEventListener('click', () => {
            const enabled = !!rollingMaskEl.querySelector('#starry-rolling-toggle')?.checked;
            GM_setValue(ROLL_KEY, enabled);
            closeRollingSettingsCard();
            // 保存后立即在当前页面应用状态，不整页刷新。
            applyFortuneState(enabled);
        });
        rollingMaskEl.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); closeRollingSettingsCard(); } });
        document.body.appendChild(rollingMaskEl);
        return rollingMaskEl;
    }

    function openRollingSettingsCard() {
        const el = buildRollingSettingsCard();
        const toggle = el.querySelector('#starry-rolling-toggle');
        if (toggle) toggle.checked = GM_getValue(ROLL_KEY, false) === true;
        void el.offsetWidth;
        el.classList.add('show');
    }

    function closeRollingSettingsCard() {
        if (rollingMaskEl) rollingMaskEl.classList.remove('show');
    }

    // ============ 运势替换 / 滚动的区开关 ============
    let fortuneIndex = 0;
    let originalFortuneText = null;
    let originalFortuneColor = null;
    function getFortuneElement() {
        return document.querySelector('.daily-fortune strong');
    }

    function isRollingChar(text) {
        return CHARS.includes((text || '').trim());
    }

    // 只保存真正的近日运势，避免把滚动字符误认为原始内容。
    function rememberOriginalFortune(el) {
        if (!el) return;
        const text = (el.textContent || '').trim();
        if (originalFortuneText === null && text && !isRollingChar(text)) {
            originalFortuneText = el.textContent;
            originalFortuneColor = el.style.color || '';
        }
    }

    function applyFortuneState(enabled) {
        const el = getFortuneElement();
        if (!el) return;
        rememberOriginalFortune(el);
        if (enabled) {
            el.style.setProperty('color', '#ff0000', 'important');
            el.textContent = CHARS[fortuneIndex % CHARS.length];
        } else {
            // 关闭时停止滚动，并立即撤销滚动字符/红色样式。
            // 若页面当前就是滚动字符，恢复保存的真实运势文本。
            if (isRollingChar(el.textContent) && originalFortuneText !== null) {
                el.textContent = originalFortuneText;
            }
            el.style.removeProperty('color');
            if (originalFortuneColor) el.style.setProperty('color', originalFortuneColor);
        }
    }

    function setupFortune() {
        const initialEl = getFortuneElement();
        if (initialEl) rememberOriginalFortune(initialEl);

        // 防护：关闭状态下若其他旧版脚本仍在写入滚动字符，
        // 在 DOM 变更后立即恢复本脚本捕获到的真实运势文本。
        let restoring = false;
        const guard = new MutationObserver(() => {
            if (restoring || GM_getValue(ROLL_KEY, false) === true) return;
            const el = getFortuneElement();
            if (!el) return;
            rememberOriginalFortune(el);
            if (isRollingChar(el.textContent) && originalFortuneText !== null) {
                restoring = true;
                el.textContent = originalFortuneText;
                el.style.removeProperty('color');
                if (originalFortuneColor) el.style.setProperty('color', originalFortuneColor);
                restoring = false;
            }
        });
        if (document.body) guard.observe(document.body, { childList: true, characterData: true, subtree: true });

        setInterval(() => {
            if (GM_getValue(ROLL_KEY, false) !== true) return;
            const el = getFortuneElement();
            if (!el) return;
            rememberOriginalFortune(el);
            fortuneIndex = (fortuneIndex + 1) % CHARS.length;
            el.style.setProperty('color', '#ff0000', 'important');
            el.textContent = CHARS[fortuneIndex];
        }, INTERVAL_MS);
    }

    // ============ 强制右上角三个按钮：默认毛玻璃，悬停深蓝 ============
    function applyUserButtonGlass() {
        const buttons = document.querySelectorAll(
            'header.ant-layout-header.front-v2-header .front-v2-actions .ant-btn, ' +
            'header.ant-layout-header.front-v2-header .front-v2-actions button, ' +
            'header.ant-layout-header.front-v2-header .front-v2-actions [role="button"], ' +
            'header.ant-layout-header.front-v2-header .front-v2-auth-slot > button.front-v2-user-button'
        );
        buttons.forEach((button) => {
            const hovered = button.matches(':hover, :focus-visible');
            const bg = hovered ? 'rgba(11, 31, 77, 0.88)' : 'rgba(255, 255, 255, 0.16)';
            const border = hovered ? 'rgba(100, 155, 245, 0.72)' : 'rgba(255, 255, 255, 0.30)';
            const shadow = hovered
                ? 'inset 0 0 0 1px rgba(75, 125, 210, 0.24), 0 4px 14px rgba(0,0,0,0.12)'
                : 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 14px rgba(0,0,0,0.08)';
            const set = (name, value) => {
                if (button.style.getPropertyValue(name) !== value || button.style.getPropertyPriority(name) !== 'important') {
                    button.style.setProperty(name, value, 'important');
                }
            };
            set('background', bg);
            set('background-color', bg);
            set('background-image', 'none');
            set('backdrop-filter', 'blur(14px) saturate(160%)');
            set('-webkit-backdrop-filter', 'blur(14px) saturate(160%)');
            set('border-color', border);
            set('border-style', 'solid');
            set('border-width', '1px');
            set('border-radius', button.matches('.front-v2-user-button') ? '12px' : '10px');
            set('color', '#ffffff');
            set('box-shadow', shadow);
            set('filter', 'none');
            button.querySelectorAll('.front-v2-user-name, .anticon, svg').forEach((el) => {
                el.style.setProperty('color', '#ffffff', 'important');
                el.style.setProperty('fill', 'currentColor', 'important');
            });
        });
    }


    // ============ 题目列表页补充适配（v1.0.13） ============
    function applyProblemsPageStyles() {
        const isProblemsPage = location.pathname.includes('/front-v2/problems');
        document.body.classList.toggle('starry-problems-page', isProblemsPage);
        if (!isProblemsPage) return;

        // 独立样式表用页面专属 body class 限定范围，避免污染其他页面。
        if (!document.getElementById('starry-problems-page-style')) {
            const style = document.createElement('style');
            style.id = 'starry-problems-page-style';
            style.textContent = `
/* v1.0.42：移除包住三块题目卡片的 problem-page 外层浅色底板。
   保留 toolbar、filter、table 三张独立卡片本身的背景与边框。 */
body.starry-problems-page .problem-page {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  filter: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
body.starry-problems-page .problem-page::before,
body.starry-problems-page .problem-page::after {
  content: none !important;
  display: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

body.starry-problems-page .ant-card,
body.starry-problems-page .ant-card-head,
body.starry-problems-page .ant-card-body,
body.starry-problems-page .ant-table-wrapper,
body.starry-problems-page .ant-table,
body.starry-problems-page .ant-table-container,
body.starry-problems-page .ant-table-content,
body.starry-problems-page .ant-table-thead > tr > th,
body.starry-problems-page .ant-table-tbody > tr,
body.starry-problems-page .ant-table-tbody > tr > td,
body.starry-problems-page .ant-pagination,
body.starry-problems-page .ant-pagination-item,
body.starry-problems-page .ant-pagination-prev,
body.starry-problems-page .ant-pagination-next,
body.starry-problems-page .ant-tabs-nav,
body.starry-problems-page .ant-tabs-tab,
body.starry-problems-page .ant-select-selector,
body.starry-problems-page .ant-input-affix-wrapper,
body.starry-problems-page .ant-input,
body.starry-problems-page .ant-picker,
body.starry-problems-page .ant-segmented,
body.starry-problems-page .ant-empty,
body.starry-problems-page .ant-list-item {
  background-image: none !important;
  box-shadow: none !important;
}
body.starry-problems-page .ant-card,
body.starry-problems-page .ant-card-body,
body.starry-problems-page .ant-table-wrapper,
body.starry-problems-page .ant-table,
body.starry-problems-page .ant-table-container,
body.starry-problems-page .ant-table-content,
body.starry-problems-page .ant-pagination,
body.starry-problems-page .ant-tabs-nav,
body.starry-problems-page .ant-empty,
body.starry-problems-page .ant-list-item {
  background-color: rgba(20, 35, 56, .42) !important;
  color: #f4f7fb !important;
  border-color: rgba(255,255,255,.18) !important;
}
body.starry-problems-page .ant-card-head,
body.starry-problems-page .ant-table-thead > tr > th {
  background-color: rgba(12, 25, 43, .90) !important;
  color: #f4f7fb !important;
  border-color: rgba(255,255,255,.20) !important;
}
body.starry-problems-page .ant-table-tbody > tr,
body.starry-problems-page .ant-table-tbody > tr > td {
  background-color: rgba(20, 35, 56, .50) !important;
  color: #f4f7fb !important;
  border-color: rgba(255,255,255,.13) !important;
}
body.starry-problems-page .ant-table-tbody > tr:nth-child(even) > td {
  background-color: rgba(29, 48, 70, .56) !important;
}
body.starry-problems-page .ant-table-tbody > tr:hover > td {
  background-color: rgba(64, 104, 145, .68) !important;
}
body.starry-problems-page .ant-table-cell-fix-left,
body.starry-problems-page .ant-table-cell-fix-right {
  background-color: rgba(20, 35, 56, .82) !important;
}
body.starry-problems-page .ant-table-thead > tr > th::before {
  background-color: rgba(255,255,255,.14) !important;
}
body.starry-problems-page .ant-select-selector,
body.starry-problems-page .ant-input-affix-wrapper,
body.starry-problems-page input.ant-input,
body.starry-problems-page .ant-picker,
body.starry-problems-page .ant-segmented {
  background-color: rgba(12, 25, 43, .72) !important;
  color: #f4f7fb !important;
  border-color: rgba(255,255,255,.25) !important;
}
body.starry-problems-page .ant-select-selection-item,
body.starry-problems-page .ant-select-selection-placeholder,
body.starry-problems-page input.ant-input,
body.starry-problems-page input.ant-input::placeholder,
body.starry-problems-page .ant-picker input,
body.starry-problems-page .ant-tabs-tab-btn,
body.starry-problems-page .ant-pagination-item a,
body.starry-problems-page .ant-pagination .anticon,
body.starry-problems-page .ant-table-cell,
body.starry-problems-page .ant-card-head-title {
  color: #f4f7fb !important;
}
body.starry-problems-page .ant-pagination-item-active {
  background-color: rgba(33,133,208,.72) !important;
  border-color: rgba(110,180,245,.8) !important;
}
body.starry-problems-page .ant-pagination-item-active a { color: #fff !important; }
/* v1.0.45：当前页码按钮使用与搜索按钮一致的蓝色，不允许 Ant Design 默认白底覆盖。 */
html body.starry-problems-page .ant-pagination .ant-pagination-item.ant-pagination-item-active,
html body.starry-problems-page .ant-pagination .ant-pagination-item.ant-pagination-item-active:hover {
  background: #2185d0 !important;
  background-color: #2185d0 !important;
  background-image: none !important;
  border-color: rgba(120,190,255,.9) !important;
  box-shadow: none !important;
}
html body.starry-problems-page .ant-pagination .ant-pagination-item.ant-pagination-item-active > a,
html body.starry-problems-page .ant-pagination .ant-pagination-item.ant-pagination-item-active:hover > a {
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
  background: transparent !important;
}

/* v1.0.51：主页真实标题栏（已由用户提供 DOM/计算样式确认）强制透明。 */
html body .front-section-head,
html body .front-section .front-section-head {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

/* v1.0.51：题库自定义分页当前页真实结构为 button.ant-btn-primary。 */
html body.starry-problems-page .problem-pagination button.ant-btn-primary,
html body.starry-problems-page .problem-pagination button.ant-btn-primary:hover,
html body.starry-problems-page .problem-pagination button.ant-btn-primary:focus {
  background: #2185d0 !important;
  background-color: #2185d0 !important;
  background-image: none !important;
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
  border-color: rgba(120,190,255,.9) !important;
  box-shadow: none !important;
}
html body.starry-problems-page .problem-pagination button.ant-btn-primary > * {
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
}
/* v1.0.51：覆盖 Ant Design 默认 hover 白底；普通页码保持深色，当前页保持蓝色。 */
html body.starry-problems-page .problem-pagination button:not(.ant-btn-primary):not(:disabled):hover,
html body.starry-problems-page .problem-pagination button:not(.ant-btn-primary):not(:disabled):focus,
html body.starry-problems-page .problem-pagination button:not(.ant-btn-primary):not(:disabled):active {
  background: rgba(12,25,43,.96) !important;
  background-color: rgba(12,25,43,.96) !important;
  background-image: none !important;
  color: #f4f7fb !important;
  -webkit-text-fill-color: #f4f7fb !important;
  border-color: rgba(120,190,255,.65) !important;
}
html body.starry-problems-page .problem-pagination button.ant-btn-primary:hover,
html body.starry-problems-page .problem-pagination button.ant-btn-primary:focus,
html body.starry-problems-page .problem-pagination button.ant-btn-primary:active {
  background: #2185d0 !important;
  background-color: #2185d0 !important;
  background-image: none !important;
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
  border-color: rgba(120,190,255,.9) !important;
}

/* v1.0.49：题库分页当前页强制蓝色；普通页码维持深色玻璃底。 */
html body.starry-problems-page .problem-pagination button,
html body.starry-problems-page .ant-pagination .ant-pagination-item {
  background: rgba(12,25,43,.88) !important;
  background-color: rgba(12,25,43,.88) !important;
  color: #f4f7fb !important;
  -webkit-text-fill-color: #f4f7fb !important;
  border: 1px solid rgba(220,235,255,.26) !important;
}
html body.starry-problems-page .problem-pagination button.active,
html body.starry-problems-page .problem-pagination button[class*="active"],
html body.starry-problems-page .problem-pagination button[aria-current="page"],
html body.starry-problems-page .problem-pagination [aria-current="page"],
html body.starry-problems-page .problem-pagination .active,
html body.starry-problems-page .ant-pagination .ant-pagination-item-active,
html body.starry-problems-page .ant-pagination .ant-pagination-item-active:hover {
  background: #2185d0 !important;
  background-color: #2185d0 !important;
  background-image: none !important;
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
  border: 1px solid rgba(120,190,255,.95) !important;
  box-shadow: none !important;
}
html body.starry-problems-page .problem-pagination button.active *,
html body.starry-problems-page .problem-pagination [aria-current="page"] *,
html body.starry-problems-page .problem-pagination .active *,
html body.starry-problems-page .ant-pagination .ant-pagination-item-active a {
  background: transparent !important;
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
}

/* v1.0.44：页码跳转输入框与顶部搜索框统一为深蓝色 */
body.starry-problems-page .ant-pagination-options-quick-jumper input,
body.starry-problems-page .problem-pagination input {
  background: rgba(12, 25, 43, .72) !important;
  background-color: rgba(12, 25, 43, .72) !important;
  background-image: none !important;
  color: #f4f7fb !important;
  -webkit-text-fill-color: #f4f7fb !important;
  border: 1px solid rgba(255, 255, 255, .25) !important;
  box-shadow: none !important;
}
body.starry-problems-page .ant-pagination-options-quick-jumper input::placeholder,
body.starry-problems-page .problem-pagination input::placeholder {
  color: #aebed0 !important;
  -webkit-text-fill-color: #aebed0 !important;
}
body.starry-problems-page .ant-pagination-options-quick-jumper input:focus,
body.starry-problems-page .problem-pagination input:focus {
  border-color: rgba(72, 160, 235, .9) !important;
  box-shadow: 0 0 0 2px rgba(33, 133, 208, .18) !important;
}
/* v1.0.46：兼容题库自定义分页组件的当前页按钮（不只依赖 Ant Design 类名）。 */
html body.starry-problems-page .problem-pagination button.active,
html body.starry-problems-page .problem-pagination button[class*="active"],
html body.starry-problems-page .problem-pagination button[aria-current="page"],
html body.starry-problems-page .problem-pagination [aria-current="page"],
html body.starry-problems-page .ant-pagination .ant-pagination-item-active {
  background: #2185d0 !important;
  background-color: #2185d0 !important;
  background-image: none !important;
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
  border: 1px solid rgba(120,190,255,.9) !important;
  box-shadow: none !important;
}
html body.starry-problems-page .problem-pagination button.active *,
html body.starry-problems-page .problem-pagination button[class*="active"] *,
html body.starry-problems-page .problem-pagination button[aria-current="page"] * {
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
}
body.starry-problems-page .ant-tag { color: inherit; }
body.starry-problems-page .ant-btn:not(.ant-btn-primary) {
  background-color: rgba(12,25,43,.76) !important;
  color: #f4f7fb !important;
  border-color: rgba(255,255,255,.24) !important;
}
body.starry-problems-page .ant-btn-primary {
  color: #fff !important;
}
/* v1.0.15：题目页自定义工具栏、标签筛选和开关的精确适配 */
body.starry-problems-page .problem-toolbar,
body.starry-problems-page .problem-toolbar .problem-searchbar,
body.starry-problems-page .problem-toolbar .problem-toolbar-controls,
body.starry-problems-page .problem-filter-compact-v2,
body.starry-problems-page .problem-filter-compact-v2 .problem-filter-select-v2 {
  background: rgba(20, 35, 56, .68) !important;
  background-color: rgba(20, 35, 56, .68) !important;
  background-image: none !important;
  color: #f4f7fb !important;
  border-color: rgba(255,255,255,.22) !important;
  box-shadow: none !important;
}
body.starry-problems-page .problem-toolbar .ant-btn,
body.starry-problems-page .problem-toolbar a.ant-btn,
body.starry-problems-page .problem-filter-actions-v2,
body.starry-problems-page .problem-tag-switch-v2 {
  color: #f4f7fb !important;
}
body.starry-problems-page .problem-toolbar .ant-btn:not(.ant-btn-primary),
body.starry-problems-page .problem-toolbar a.ant-btn:not(.ant-btn-primary) {
  background: rgba(12,25,43,.82) !important;
  background-color: rgba(12,25,43,.82) !important;
  border-color: rgba(255,255,255,.28) !important;
}
body.starry-problems-page .problem-toolbar .ant-btn-primary {
  background: rgba(33,133,208,.86) !important;
  background-color: rgba(33,133,208,.86) !important;
  border-color: rgba(110,180,245,.7) !important;
}
body.starry-problems-page .problem-toolbar .anticon,
body.starry-problems-page .problem-toolbar .ant-btn span,
body.starry-problems-page .problem-filter-actions-v2,
body.starry-problems-page .problem-tag-switch-v2,
body.starry-problems-page .problem-tag-switch-v2 .ant-switch-inner {
  color: #f4f7fb !important;
}
body.starry-problems-page .problem-filter-compact-v2 .ant-select-selector {
  background: rgba(12,25,43,.82) !important;
  background-color: rgba(12,25,43,.82) !important;
  color: #f4f7fb !important;
  border-color: rgba(255,255,255,.28) !important;
}
body.starry-problems-page .problem-filter-compact-v2 .ant-select-selection-placeholder,
body.starry-problems-page .problem-filter-compact-v2 .ant-select-selection-item,
body.starry-problems-page .problem-filter-compact-v2 .ant-select-arrow {
  color: #f4f7fb !important;
}
body.starry-problems-page .problem-tag-switch-v2 .ant-switch:not(.ant-switch-checked) {
  background: rgba(150,165,185,.65) !important;
}
body.starry-problems-page .problem-tag-switch-v2 .ant-switch-checked {
  background: #2185d0 !important;
}
body.starry-problems-page .problem-toolbar a.ant-btn,
body.starry-problems-page .problem-toolbar a.ant-btn span {
  text-decoration-color: rgba(255,255,255,.6) !important;
}

/* v1.0.19：修正分类标签开关圆角，避免滑块呈方形 */
body.starry-problems-page .problem-tag-switch-v2 .ant-switch,
body.starry-problems-page .problem-tag-switch-v2 button[role="switch"] {
  border-radius: 999px !important;
  overflow: hidden !important;
  min-width: 28px !important;
}
body.starry-problems-page .problem-tag-switch-v2 .ant-switch .ant-switch-handle,
body.starry-problems-page .problem-tag-switch-v2 .ant-switch .ant-switch-handle::before,
body.starry-problems-page .problem-tag-switch-v2 button[role="switch"] .ant-switch-handle {
  border-radius: 50% !important;
}
body.starry-problems-page .problem-tag-switch-v2 .ant-switch .ant-switch-handle {
  width: 12px !important;
  height: 12px !important;
  top: 3px !important;
  inset-inline-start: 3px !important;
}
body.starry-problems-page .problem-tag-switch-v2 .ant-switch.ant-switch-checked .ant-switch-handle {
  inset-inline-start: calc(100% - 15px) !important;
}

/* v1.0.17：分类标签开关强制适配，并彻底移除题目页三张卡片的投影 */
body.starry-problems-page .problem-filter-actions-v2,
body.starry-problems-page .problem-filter-actions-v2 .problem-tag-switch-v2,
body.starry-problems-page .problem-tag-switch-v2,
body.starry-problems-page .problem-tag-switch-v2 .ant-switch,
body.starry-problems-page .problem-tag-switch-v2 .ant-switch-inner,
body.starry-problems-page .problem-tag-switch-v2 .ant-switch-handle {
  color: #f4f7fb !important;
  -webkit-text-fill-color: #f4f7fb !important;
  text-shadow: none !important;
  box-shadow: none !important;
}
body.starry-problems-page .problem-tag-switch-v2 .ant-switch:not(.ant-switch-checked) {
  background: rgba(150,165,185,.65) !important;
  background-color: rgba(150,165,185,.65) !important;
}
body.starry-problems-page .problem-tag-switch-v2 .ant-switch-checked {
  background: #2185d0 !important;
  background-color: #2185d0 !important;
}
body.starry-problems-page .problem-toolbar,
body.starry-problems-page .problem-filter-compact-v2,
body.starry-problems-page .problem-table-card,
body.starry-problems-page .problem-toolbar::before,
body.starry-problems-page .problem-toolbar::after,
body.starry-problems-page .problem-filter-compact-v2::before,
body.starry-problems-page .problem-filter-compact-v2::after,
body.starry-problems-page .problem-table-card::before,
body.starry-problems-page .problem-table-card::after {
  box-shadow: none !important;
  filter: none !important;
}

/* v1.0.19：针对真实开关控件和卡片阴影来源的强制修复 */
body.starry-problems-page .problem-tag-switch-v2,
body.starry-problems-page .problem-tag-switch-v2 * {
  text-shadow: none !important;
}
body.starry-problems-page .problem-tag-switch-v2 .ant-switch {
  background: rgba(90, 110, 135, .95) !important;
  background-color: rgba(90, 110, 135, .95) !important;
  border: 1px solid rgba(220, 235, 255, .35) !important;
  box-shadow: none !important;
}
body.starry-problems-page .problem-tag-switch-v2 .ant-switch .ant-switch-handle::before,
body.starry-problems-page .problem-tag-switch-v2 .ant-switch .ant-switch-handle {
  background: #23364d !important;
  background-color: #23364d !important;
  box-shadow: none !important;
}
body.starry-problems-page .problem-tag-switch-v2 .ant-switch.ant-switch-checked {
  background: #2185d0 !important;
  background-color: #2185d0 !important;
}
body.starry-problems-page .problem-toolbar,
body.starry-problems-page .problem-filter-compact-v2,
body.starry-problems-page .problem-table-card,
body.starry-problems-page .problem-table-head,
body.starry-problems-page .problem-table-body,
body.starry-problems-page .problem-toolbar *,
body.starry-problems-page .problem-filter-compact-v2 *,
body.starry-problems-page .problem-table-card *,
body.starry-problems-page .problem-toolbar::before,
body.starry-problems-page .problem-toolbar::after,
body.starry-problems-page .problem-filter-compact-v2::before,
body.starry-problems-page .problem-filter-compact-v2::after,
body.starry-problems-page .problem-table-card::before,
body.starry-problems-page .problem-table-card::after {
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  filter: none !important;
  -webkit-filter: none !important;
}

/* v1.0.16：真实自定义题目列表 DOM */
body.starry-problems-page .problem-table-card,
body.starry-problems-page .problem-table-head,
body.starry-problems-page .problem-table-body,
body.starry-problems-page .problem-row {
  background: rgba(13, 27, 45, .62) !important;
  background-image: none !important;
  color: #f4f7fb !important;
  border-color: rgba(220,235,255,.16) !important;
  box-shadow: none !important;
}
body.starry-problems-page .problem-table-head {
  background: rgba(8, 19, 34, .92) !important;
}
body.starry-problems-page .problem-table-head *,
body.starry-problems-page .problem-row .problem-id,
body.starry-problems-page .problem-row .problem-title-cell a,
body.starry-problems-page .problem-row .problem-rate strong {
  color: #f4f7fb !important;
  -webkit-text-fill-color: #f4f7fb !important;
}
body.starry-problems-page .problem-row .problem-status.muted {
  color: #c4cfdd !important;
  -webkit-text-fill-color: #c4cfdd !important;
  background: rgba(100, 116, 139, .20) !important;
  opacity: 1 !important;
  text-shadow: none !important;
}
body.starry-problems-page .problem-row .problem-status.accepted {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}
body.starry-problems-page .problem-row .problem-difficulty,
body.starry-problems-page .problem-row .problem-difficulty * {
  -webkit-text-fill-color: #fff !important;
}
body.starry-problems-page .problem-row .problem-rate > span {
  background: rgba(220,235,255,.12) !important;
}
body.starry-problems-page .problem-pagination {
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  gap: 8px !important;
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}
body.starry-problems-page .problem-table-card .problem-pagination button,
body.starry-problems-page .problem-table-card .problem-pagination button:not(.ant-btn-primary) {
  background: rgba(12, 25, 43, .88) !important;
  color: #f4f7fb !important;
  -webkit-text-fill-color: #f4f7fb !important;
  border: 1px solid rgba(220,235,255,.26) !important;
  box-shadow: none !important;
}
body.starry-problems-page .problem-table-card .problem-pagination button.ant-btn-primary {
  background: #2185d0 !important;
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
  border-color: rgba(120,190,255,.8) !important;
}
body.starry-problems-page .problem-table-card .problem-pagination button:disabled {
  color: #8290a3 !important;
  -webkit-text-fill-color: #8290a3 !important;
  opacity: .8 !important;
}
body.starry-problems-page .problem-pagination > span {
  color: #f4f7fb !important;
  -webkit-text-fill-color: #f4f7fb !important;
}
body.starry-problems-page .problem-table-card::before,
body.starry-problems-page .problem-table-card::after,
body.starry-problems-page .problem-row::before,
body.starry-problems-page .problem-row::after {
  box-shadow: none !important;
  filter: none !important;
}
`;
            (document.head || document.documentElement).appendChild(style);
        }

        // 给当前已渲染的节点补 inline important，抵御站点动态主题和表格重渲染。
        const set = (el, prop, value) => el.style.setProperty(prop, value, 'important');

        // 仅清理确实承载题目列表三张卡片的外层容器，避免影响比赛区域或其他复用 .problem-page 类名的模块。
        document.querySelectorAll('body.starry-problems-page .problem-page').forEach(page => {
            if (!page.querySelector('.problem-toolbar, .problem-filter-compact-v2, .problem-table-card')) return;
            ['background-color', 'border', 'outline',
             'box-shadow', '-webkit-box-shadow', 'filter', '-webkit-filter', 'backdrop-filter', '-webkit-backdrop-filter']
                .forEach(prop => set(page, prop, 'none'));
            set(page, 'background-color', 'transparent');
        });

        // 自定义题目列表在 SPA 切页/重渲染时再次强制应用样式。
        document.querySelectorAll('.problem-table-card').forEach(card => {
            set(card, 'background-color', 'rgba(13, 27, 45, 0.62)');
            set(card, 'background-image', 'none');
            set(card, 'box-shadow', 'none');
            card.querySelectorAll('.problem-pagination').forEach(p => {
                set(p, 'background', 'transparent');
                set(p, 'box-shadow', 'none');
                p.querySelectorAll('button').forEach(btn => {
                    const active = btn.classList.contains('ant-btn-primary') || btn.classList.contains('active') || btn.getAttribute('aria-current') === 'page' || btn.getAttribute('data-active') === 'true';
                    set(btn, 'background-color', active ? '#2185d0' : 'rgba(12, 25, 43, 0.88)');
                    set(btn, 'color', active ? '#ffffff' : '#f4f7fb');
                    set(btn, '-webkit-text-fill-color', active ? '#ffffff' : '#f4f7fb');
                    set(btn, 'border-color', 'rgba(220,235,255,0.26)');
                    set(btn, 'box-shadow', 'none');
                });
            });
            card.querySelectorAll('.problem-table-head, .problem-row').forEach(row => {
                set(row, 'background-color', row.classList.contains('problem-table-head') ? 'rgba(8, 19, 34, 0.92)' : 'rgba(13, 27, 45, 0.62)');
                set(row, 'color', '#f4f7fb');
                set(row, 'box-shadow', 'none');
            });
            card.querySelectorAll('.problem-status.muted').forEach(status => {
                set(status, 'color', '#c4cfdd');
                set(status, '-webkit-text-fill-color', '#c4cfdd');
                set(status, 'opacity', '1');
                set(status, 'background-color', 'rgba(100,116,139,0.20)');
                set(status, 'text-shadow', 'none');
            });
            // 原版 BeCoder 的 AC 状态文字为白色；防止刷新循环重新写回浅绿色。
            card.querySelectorAll('.problem-status.accepted').forEach(status => {
                set(status, 'color', '#ffffff');
                set(status, '-webkit-text-fill-color', '#ffffff');
                set(status, 'text-shadow', 'none');
            });
            // 题目页卡片内部不添加文字阴影，避免状态文字产生灰色光晕。
            card.querySelectorAll('*').forEach(child => {
                set(child, 'text-shadow', 'none');
            });
            card.querySelectorAll('.problem-id, .problem-title-cell a, .problem-rate strong, .problem-table-head > *').forEach(el => {
                set(el, 'color', '#f4f7fb');
                set(el, '-webkit-text-fill-color', '#f4f7fb');
            });
        });
        document.querySelectorAll('.ant-table-thead > tr > th').forEach(el => {
            set(el, 'background-color', 'rgba(12, 25, 43, 0.90)');
            set(el, 'background-image', 'none');
            set(el, 'color', '#f4f7fb');
            set(el, 'border-color', 'rgba(255,255,255,0.20)');
        });
        document.querySelectorAll('.ant-table-tbody > tr').forEach((row, index) => {
            row.style.setProperty('background-color', index % 2 ? 'rgba(29, 48, 70, 0.56)' : 'rgba(20, 35, 56, 0.50)', 'important');
            row.querySelectorAll('td').forEach(td => {
                set(td, 'background-color', index % 2 ? 'rgba(29, 48, 70, 0.56)' : 'rgba(20, 35, 56, 0.50)');
                set(td, 'color', '#f4f7fb');
                set(td, 'border-color', 'rgba(255,255,255,0.13)');
            });
        });
        document.querySelectorAll('.ant-card, .ant-card-body, .ant-table-wrapper, .ant-table, .ant-table-container, .ant-pagination, .ant-tabs-nav, .ant-list-item, .ant-empty').forEach(el => {
            set(el, 'background-color', 'rgba(20, 35, 56, 0.42)');
            set(el, 'background-image', 'none');
            set(el, 'border-color', 'rgba(255,255,255,0.18)');
        });
        document.querySelectorAll('.ant-select-selector, .ant-input-affix-wrapper, input.ant-input, .ant-picker, .ant-segmented').forEach(el => {
            set(el, 'background-color', 'rgba(12, 25, 43, 0.72)');
            set(el, 'color', '#f4f7fb');
            set(el, 'border-color', 'rgba(255,255,255,0.25)');
        });

        // v1.0.14：截图中的题目页表格使用了非 Ant Design 的自定义节点，
        // 因而仅覆盖 .ant-table-* 无法命中。用列标题识别真实表头，再处理其同级行。
        const darken = (el, bg, textColor = '#f4f7fb') => {
            if (!el || el.closest('header')) return;
            set(el, 'background', bg);
            set(el, 'background-color', bg);
            set(el, 'background-image', 'none');
            set(el, 'color', textColor);
            set(el, 'border-color', 'rgba(255,255,255,0.18)');
            set(el, 'box-shadow', 'none');
        };
        const norm = el => (el.innerText || el.textContent || '').replace(/\s+/g, '').trim();
        const isProblemHeader = el => {
            const t = norm(el);
            return t.includes('题目名称') && t.includes('难度') && (t.includes('通过率') || t.includes('通过数'));
        };
        document.querySelectorAll('div, section, ul, ol, table, thead, tr').forEach(el => {
            if (!isProblemHeader(el)) return;
            // 尽量选最小的、包含完整列名的节点，避免误伤整张页面。
            if (Array.from(el.children).some(isProblemHeader)) return;
            const headerRow = el.matches('tr, thead') ? (el.matches('thead') ? el.querySelector('tr') : el) : el;
            darken(headerRow, 'rgba(12, 25, 43, 0.94)');
            headerRow.querySelectorAll('*').forEach(child => {
                if (!child.matches('input, button, a, .ant-tag')) set(child, 'color', '#f4f7fb');
            });
            const rowContainer = headerRow.parentElement;
            if (rowContainer) {
                let next = headerRow.nextElementSibling;
                let index = 0;
                while (next && index < 100) {
                    const txt = norm(next);
                    if (!txt) { next = next.nextElementSibling; continue; }
                    darken(next, index % 2 ? 'rgba(29, 48, 70, 0.70)' : 'rgba(20, 35, 56, 0.64)');
                    next.querySelectorAll('*').forEach(child => {
                        if (child.matches('.ant-tag, .ant-badge, [class*="status"], [class*="difficulty"], [class*="progress"]')) return;
                        if (child.matches('a, span, div, td, th, p, strong')) set(child, 'color', '#f4f7fb');
                    });
                    index++;
                    next = next.nextElementSibling;
                }
            }
        });

        // 题目页自定义筛选栏/搜索栏：按占位提示和 class 名识别，排除站点全局导航。
        document.querySelectorAll('input, textarea, [contenteditable="true"]').forEach(input => {
            if (input.closest('header')) return;
            const hint = `${input.getAttribute('placeholder') || ''} ${input.getAttribute('aria-label') || ''}`;
            const chain = `${input.className || ''} ${input.parentElement?.className || ''} ${input.parentElement?.parentElement?.className || ''}`;
            if (!/问题|题目|标签|搜索|输入文本|筛选|难度/.test(hint + ' ' + chain)) return;
            darken(input, 'rgba(12, 25, 43, 0.78)');
            set(input, 'border', '1px solid rgba(255,255,255,0.26)');
            set(input, 'outline-color', 'rgba(110,180,245,0.8)');
            if (input.matches('input, textarea')) set(input, 'caret-color', '#ffffff');
            let wrap = input.parentElement;
            for (let depth = 0; wrap && depth < 3 && !wrap.closest('header'); depth++, wrap = wrap.parentElement) {
                const c = String(wrap.className || '');
                if (/filter|search|toolbar|query|tag/i.test(c)) darken(wrap, 'rgba(20, 35, 56, 0.68)');
            }
        });

        // 对精确的自定义控件补充 inline important，避免站点组件样式覆盖。
        document.querySelectorAll('.problem-toolbar, .problem-toolbar .problem-searchbar, .problem-toolbar .problem-toolbar-controls, .problem-filter-compact-v2, .problem-filter-compact-v2 .problem-filter-select-v2').forEach(el => {
            darken(el, 'rgba(20, 35, 56, 0.68)');
        });
        document.querySelectorAll('.problem-toolbar .ant-btn:not(.ant-btn-primary), .problem-toolbar a.ant-btn:not(.ant-btn-primary)').forEach(el => {
            darken(el, 'rgba(12, 25, 43, 0.82)');
        });
        document.querySelectorAll('.problem-toolbar .ant-btn-primary').forEach(el => {
            darken(el, 'rgba(33, 133, 208, 0.86)', '#ffffff');
        });
        document.querySelectorAll('.problem-toolbar .ant-btn span, .problem-toolbar .anticon, .problem-filter-actions-v2, .problem-tag-switch-v2, .problem-tag-switch-v2 .ant-switch-inner').forEach(el => set(el, 'color', '#f4f7fb'));
        document.querySelectorAll('.problem-filter-compact-v2 .ant-select-selector').forEach(el => darken(el, 'rgba(12, 25, 43, 0.82)'));
        document.querySelectorAll('.problem-tag-switch-v2 .ant-switch:not(.ant-switch-checked)').forEach(el => set(el, 'background-color', 'rgba(150,165,185,0.65)'));
        document.querySelectorAll('.problem-tag-switch-v2 .ant-switch-checked').forEach(el => set(el, 'background-color', '#2185d0'));
        // v1.0.17：站点会给分类标签开关写入 inline style，使用 setProperty important 覆盖。
        document.querySelectorAll('.problem-filter-actions-v2, .problem-tag-switch-v2').forEach(el => {
            set(el, 'color', '#f4f7fb');
            set(el, '-webkit-text-fill-color', '#f4f7fb');
            set(el, 'text-shadow', 'none');
            set(el, 'box-shadow', 'none');
        });
        document.querySelectorAll('.problem-tag-switch-v2 .ant-switch').forEach(el => {
            set(el, 'background-color', el.classList.contains('ant-switch-checked') ? '#2185d0' : 'rgba(150,165,185,0.65)');
            set(el, 'box-shadow', 'none');
        });
        document.querySelectorAll('.problem-toolbar, .problem-filter-compact-v2, .problem-table-card').forEach(el => {
            set(el, 'box-shadow', 'none');
            set(el, 'filter', 'none');
        });
        // v1.0.19：覆盖 Ant Design 开关的白色滑块，并清除卡片内部及伪元素投影。
        document.querySelectorAll('.problem-tag-switch-v2 .ant-switch').forEach(el => {
            set(el, 'background-color', el.classList.contains('ant-switch-checked') ? '#2185d0' : 'rgba(90,110,135,0.95)');
            set(el, 'border', '1px solid rgba(220,235,255,0.35)');
            set(el, 'border-radius', '999px');
            set(el, 'width', '30px');
            set(el, 'height', '18px');
            set(el, 'min-width', '30px');
            set(el, 'padding', '0');
            set(el, 'overflow', 'hidden');
            set(el, 'box-shadow', 'none');
            el.querySelectorAll('.ant-switch-handle, .ant-switch-handle::before').forEach(handle => {
                set(handle, 'background-color', '#23364d');
                set(handle, 'border-radius', '50%');
                set(handle, 'width', '12px');
                set(handle, 'height', '12px');
                set(handle, 'top', '2px');
                set(handle, 'inset-inline-start', el.classList.contains('ant-switch-checked') ? '14px' : '2px');
                set(handle, 'margin', '0');
                set(handle, 'box-shadow', 'none');
            });
        });
        document.querySelectorAll('.problem-toolbar, .problem-filter-compact-v2, .problem-table-card, .problem-table-head, .problem-table-body').forEach(card => {
            set(card, 'box-shadow', 'none');
            set(card, '-webkit-box-shadow', 'none');
            set(card, 'filter', 'none');
            set(card, '-webkit-filter', 'none');
            card.querySelectorAll('*').forEach(child => {
                set(child, 'box-shadow', 'none');
                set(child, '-webkit-box-shadow', 'none');
                set(child, 'filter', 'none');
                set(child, '-webkit-filter', 'none');
            });
        });

        // “未提交”通常使用站点自定义状态色；单独提高文字对比度，不改变其他状态徽标。
        document.querySelectorAll('body.starry-problems-page *').forEach(el => {
            if (el.children.length > 0 || el.closest('header')) return;
            if (norm(el) === '未提交') {
                set(el, 'color', '#f4f7fb');
                set(el, '-webkit-text-fill-color', '#f4f7fb');
                if (el.tagName !== 'A') set(el, 'background-color', 'rgba(12,25,43,0.72)');
                set(el, 'text-shadow', 'none');
            }
        });

        // 自定义题目页卡片/筛选面板：只处理内容区中带相关 class 的容器。
        document.querySelectorAll('main [class], #root [class]').forEach(el => {
            if (el.closest('header') || el.children.length > 30) return;
            const c = String(el.className || '');
            if (!/(problem|filter|search|toolbar|query|pagination)/i.test(c)) return;
            if (/(status|difficulty|progress|accepted|rate|tag|badge|icon|title|name)/i.test(c)) return;
            const r = el.getBoundingClientRect();
            if (r.width < 180 || r.height < 28) return;
            darken(el, 'rgba(20, 35, 56, 0.58)');
        });
    }

    // ============ 比赛列表页适配（v1.0.31） ============
    function applyContestsPageStyles() {
        const isContestsPage = /^\/front-v2\/contests\/?$/.test(location.pathname);
        document.body.classList.toggle('starry-contests-page', isContestsPage);
        if (!isContestsPage) return;

        if (!document.getElementById('starry-contests-page-style')) {
            const style = document.createElement('style');
            style.id = 'starry-contests-page-style';
            style.textContent = `
body.starry-contests-page .contest-table-card {
  background: rgba(13, 27, 45, .62) !important;
  background-color: rgba(13, 27, 45, .62) !important;
  background-image: none !important;
  border: 1px solid rgba(255,255,255,.20) !important;
  border-radius: 14px !important;
  box-shadow: 0 8px 28px rgba(0,0,0,.10) !important;
  color: #f4f7fb !important;
  backdrop-filter: blur(18px) saturate(130%);
  -webkit-backdrop-filter: blur(18px) saturate(130%);
}
/* 比赛列表：清除表格中间层可能残留的 Ant Design 白底，保留卡片与行的深色底。 */
body.starry-contests-page .contest-table-card .ant-table,
body.starry-contests-page .contest-table-card .ant-table-container,
body.starry-contests-page .contest-table-card .ant-table-content,
body.starry-contests-page .contest-table-card .contest-table-body,
body.starry-contests-page .contest-table-card .contest-list-body,
body.starry-contests-page .contest-table-card .ant-table-tbody,
body.starry-contests-page .contest-table-card .ant-table-tbody > tr > td {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}
body.starry-contests-page .contest-table-head {
  background: rgba(8, 19, 34, .92) !important;
  color: #f4f7fb !important;
  border-color: rgba(255,255,255,.18) !important;
}
body.starry-contests-page .contest-row-v2 {
  background: rgba(20, 35, 56, .50) !important;
  color: #f4f7fb !important;
  border-color: rgba(255,255,255,.13) !important;
  box-shadow: none !important;
}
body.starry-contests-page .contest-row-v2:nth-child(even) {
  background: rgba(29, 48, 70, .56) !important;
}
body.starry-contests-page .contest-title-cell-v2 > a,
body.starry-contests-page .contest-group-cell-v2 > a,
body.starry-contests-page .contest-time-cell,
body.starry-contests-page .contest-time-cell strong,
body.starry-contests-page .contest-time-cell span,
body.starry-contests-page .contest-table-head > span,
body.starry-contests-page .contest-row-badges,
body.starry-contests-page .contest-creator-cell a,
body.starry-contests-page .contest-meta-cell-v2,
body.starry-contests-page .contest-rule-text-v2 {
  color: #f4f7fb !important;
  -webkit-text-fill-color: #f4f7fb !important;
}
body.starry-contests-page .contest-row-v2 a:hover {
  color: #91caff !important;
  -webkit-text-fill-color: #91caff !important;
}
body.starry-contests-page .contest-pagination {
  background: transparent !important;
  color: #f4f7fb !important;
}
body.starry-contests-page .contest-pagination button {
  background: rgba(12, 25, 43, .88) !important;
  color: #f4f7fb !important;
  -webkit-text-fill-color: #f4f7fb !important;
  border: 1px solid rgba(220,235,255,.26) !important;
  box-shadow: none !important;
}
body.starry-contests-page .contest-pagination button.ant-btn-primary {
  background: #2185d0 !important;
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
  border-color: rgba(120,190,255,.8) !important;
}
body.starry-contests-page .contest-pagination button:disabled {
  color: #8290a3 !important;
  -webkit-text-fill-color: #8290a3 !important;
  opacity: .8 !important;
}
`;
            (document.head || document.documentElement).appendChild(style);
        }

        const set = (el, prop, value) => el.style.setProperty(prop, value, 'important');
        const card = document.querySelector('.contest-table-card');
        if (!card) return;
        set(card, 'background', 'rgba(13,27,45,.62)');
        set(card, 'background-color', 'rgba(13,27,45,.62)');
        set(card, 'background-image', 'none');
        set(card, 'color', '#f4f7fb');
        set(card, 'border-color', 'rgba(255,255,255,.20)');
        set(card, 'box-shadow', 'none');
        card.querySelectorAll('.ant-table, .ant-table-container, .ant-table-content, .contest-table-body, .contest-list-body, .ant-table-tbody').forEach(el => {
            set(el, 'background', 'transparent');
            set(el, 'background-color', 'transparent');
            set(el, 'background-image', 'none');
            set(el, 'box-shadow', 'none');
        });
        card.querySelectorAll('.ant-table-tbody > tr > td').forEach(el => {
            set(el, 'background', 'transparent');
            set(el, 'background-color', 'transparent');
            set(el, 'box-shadow', 'none');
        });

        card.querySelectorAll('.contest-table-head').forEach(el => {
            set(el, 'background', 'rgba(8,19,34,.92)');
            set(el, 'color', '#f4f7fb');
            set(el, 'border-color', 'rgba(255,255,255,.18)');
        });
        card.querySelectorAll('.contest-row-v2').forEach((row, index) => {
            set(row, 'background', index % 2 ? 'rgba(29,48,70,.56)' : 'rgba(20,35,56,.50)');
            set(row, 'color', '#f4f7fb');
            set(row, 'border-color', 'rgba(255,255,255,.13)');
            set(row, 'box-shadow', 'none');
        });
        card.querySelectorAll('.contest-title-cell-v2 > a, .contest-group-cell-v2 > a, .contest-time-cell, .contest-time-cell strong, .contest-time-cell span, .contest-table-head > span, .contest-creator-cell a, .contest-meta-cell-v2, .contest-rule-text-v2').forEach(el => {
            set(el, 'color', '#f4f7fb');
            set(el, '-webkit-text-fill-color', '#f4f7fb');
        });
        card.querySelectorAll('.contest-pagination').forEach(pagination => {
            set(pagination, 'background', 'transparent');
            pagination.querySelectorAll('button').forEach(button => {
                const active = button.classList.contains('ant-btn-primary');
                set(button, 'background', active ? '#2185d0' : 'rgba(12,25,43,.88)');
                set(button, 'color', active ? '#fff' : '#f4f7fb');
                set(button, '-webkit-text-fill-color', active ? '#fff' : '#f4f7fb');
                set(button, 'border-color', active ? 'rgba(120,190,255,.8)' : 'rgba(220,235,255,.26)');
                set(button, 'box-shadow', 'none');
            });
        });
    }

    // 题库自定义分页当前页使用 ant-btn-primary（由用户提供的真实 DOM 确认）。
    function applyProblemPaginationActiveStyle() {
        if (!document.body.classList.contains('starry-problems-page')) return;
        document.querySelectorAll('body.starry-problems-page .problem-pagination button.ant-btn-primary').forEach(button => {
            [['background', '#2185d0'], ['background-color', '#2185d0'], ['background-image', 'none'],
             ['color', '#fff'], ['-webkit-text-fill-color', '#fff'],
             ['border-color', 'rgba(120,190,255,.9)'], ['box-shadow', 'none']].forEach(([property, value]) => {
                if (button.style.getPropertyValue(property).trim() !== value ||
                    button.style.getPropertyPriority(property) !== 'important') {
                    button.style.setProperty(property, value, 'important');
                }
            });
        });
    }

    // ============ 一次性刷新 ============
    function refreshStyles() {
        applyThemeVariables();
        applyBackground(getBackgroundUrl());
        applyHeaderAndFooterStyles();
        applyCardStyles();
        applyHomeSectionHeadTransparency();
        applyUserButtonGlass();
        applyProblemsPageStyles();
        applyProblemPaginationActiveStyle();
        applyContestsPageStyles();
    }

    // ============ 启动 ============
    applyThemeVariables();
    applyBackground(getBackgroundUrl());
    injectCSS();
    setupFortune();
    setupDropdownInjector();

    applyHeaderAndFooterStyles();
    applyCardStyles();
    applyHomeSectionHeadTransparency();
    applyUserButtonGlass();
    applyProblemsPageStyles();
    applyProblemPaginationActiveStyle();
    applyContestsPageStyles();

    // v1.0.46：首页布局层透明，保留 documentElement 上的背景图片。
    applyHomeBackgroundTransparency();

    // 不再每 800ms 全页面重刷样式。启动时和设置保存时应用；SPA 新增/替换页面节点时按需补一次。
    const problemRootStyleObservers = new WeakMap();
    function watchProblemRootInlineStyle() {
        const root = document.querySelector('body.starry-problems-page .problem-page');
        if (!root || problemRootStyleObservers.has(root)) return;
        const observer = new MutationObserver(() => {
            // 仅当站点再次写入非透明背景时修正，避免对自身写入的透明值反复操作。
            const bg = root.style.getPropertyValue('background-color').trim();
            const background = root.style.getPropertyValue('background').trim();
            if ((bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') ||
                (background && !background.includes('transparent') && !background.includes('rgba(0, 0, 0, 0)'))) {
                root.style.setProperty('background', 'transparent', 'important');
                root.style.setProperty('background-color', 'transparent', 'important');
            }
        });
        observer.observe(root, { attributes: true, attributeFilter: ['style'] });
        problemRootStyleObservers.set(root, observer);
    }

    new MutationObserver((mutations) => {
        if (!document.getElementById('starry-becoder-style')) injectCSS();
        const pageAdded = mutations.some(m => [...m.addedNodes].some(node =>
            node.nodeType === 1 && (node.matches?.('.problem-page, .problem-toolbar, .problem-table-card') ||
                node.querySelector?.('.problem-page, .problem-toolbar, .problem-table-card'))));
        const paginationAdded = mutations.some(m => [...m.addedNodes].some(node =>
            node.nodeType === 1 && (node.matches?.('.problem-pagination') ||
                node.querySelector?.('.problem-pagination'))));
        if (pageAdded) {
            applyProblemsPageStyles();
            applyProblemPaginationActiveStyle();
            applyContestsPageStyles();
            watchProblemRootInlineStyle();
        }
        if (paginationAdded) applyProblemPaginationActiveStyle();
        if (location.pathname === '/' || location.pathname === '/front-v2/home') {
            const homeAdded = mutations.some(m => [...m.addedNodes].some(node =>
                node.nodeType === 1 && (node.matches?.('.front-v2-shell, .front-v2-content, .ant-layout-content, #root') ||
                    node.querySelector?.('.front-v2-shell, .front-v2-content, .ant-layout-content'))));
            if (homeAdded) applyHomeBackgroundTransparency();
            const sectionHeadAdded = mutations.some(m => [...m.addedNodes].some(node =>
                node.nodeType === 1 && (node.matches?.('.front-section-head') ||
                    node.querySelector?.('.front-section-head'))));
            if (sectionHeadAdded) applyHomeSectionHeadTransparency();
        }
    }).observe(document.body, { childList: true, subtree: true });

    // v1.0.51：移除对整个 body 子树的 style 属性监听，避免首页 React 高频改样式时反复触发全量查询。

    watchProblemRootInlineStyle();

    // v1.0.43：新版顶栏可能在 React 更新时被替换或重写行内背景。
    // 只观察顶栏自身的 style 属性；不轮询、不触碰首页主体和比赛卡片。
    const headerStyleObserver = new MutationObserver((mutations) => {
        const expected = 'rgba(20, 35, 56, 0.82)';
        const needsRepair = mutations.some(({ target }) => {
            if (!(target instanceof Element) || !target.matches('header.ant-layout-header, header.front-v2-header, header.auth-topbar')) return false;
            const value = target.style.getPropertyValue('background-color').trim();
            const priority = target.style.getPropertyPriority('background-color');
            return value !== expected || priority !== 'important';
        });
        if (needsRepair) applyHeaderAndFooterStyles();
    });
    headerStyleObserver.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
    });

    // 顶栏节点被 React 整体替换时，立即补回深色玻璃样式。
    const headerNodeObserver = new MutationObserver((mutations) => {
        const headerAdded = mutations.some(({ addedNodes }) => [...addedNodes].some(node =>
            node.nodeType === 1 && (node.matches?.('header.ant-layout-header, header.front-v2-header, header.auth-topbar') ||
                node.querySelector?.('header.ant-layout-header, header.front-v2-header, header.auth-topbar'))));
        if (headerAdded) applyHeaderAndFooterStyles();
    });
    headerNodeObserver.observe(document.body, { childList: true, subtree: true });

    // v1.0.23：针对用户提供的真实 DOM，移除左侧消息列表 aside 外框。
    // 只处理 aside 本身及其伪元素，不触碰列表行、搜索框、按钮和内部功能边框。
    GM_addStyle(`
      html body aside.messages-sidebar-v2 {
        border: 0 !important;
        border-width: 0 !important;
        border-style: none !important;
        border-color: transparent !important;
        border-image: none !important;
        outline: 0 !important;
        outline-offset: 0 !important;
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
        filter: none !important;
      }
      html body aside.messages-sidebar-v2::before,
      html body aside.messages-sidebar-v2::after {
        content: none !important;
        display: none !important;
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
        background: transparent !important;
      }
    `);



    // v1.0.25：按登录页实际 DOM（auth-login-canvas / auth-login-card / auth-login-side）处理外框。
    // 验证码按钮存在 inline !important 深色背景，需同步清理其行内样式。
    GM_addStyle(`
      html body main.auth-login-canvas,
      html body main.auth-login-canvas > .auth-login-card,
      html body main.auth-login-canvas > .auth-login-side,
      html body .auth-login-card,
      html body .auth-login-side,
      html body .auth-login-side .auth-qr-panel {
        border: 0 !important;
        border-width: 0 !important;
        border-style: none !important;
        border-color: transparent !important;
        outline: 0 !important;
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
      }
      html body main.auth-login-canvas::before,
      html body main.auth-login-canvas::after,
      html body .auth-login-card::before,
      html body .auth-login-card::after,
      html body .auth-login-side::before,
      html body .auth-login-side::after,
      html body .auth-qr-panel::before,
      html body .auth-qr-panel::after {
        content: none !important;
        display: none !important;
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
      }
      html body .auth-captcha {
        background: rgba(255, 255, 255, 0.65) !important;
        background-color: rgba(255, 255, 255, 0.65) !important;
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
        line-height: 0 !important;
      }
      html body .auth-captcha img {
        display: block !important;
        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
      }
      html body main.auth-page,
      html body .auth-page main,
      html body .auth-card,
      html body .login-card,
      html body .register-card,
      html body .auth-container > .ant-card,
      html body .auth-content > .ant-card,
      html body .login-container > .ant-card,
      html body .register-container > .ant-card {
        border: 0 !important;
        border-width: 0 !important;
        border-style: none !important;
        border-color: transparent !important;
        outline: 0 !important;
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
      }
      html body .auth-card::before,
      html body .auth-card::after,
      html body .login-card::before,
      html body .login-card::after,
      html body .register-card::before,
      html body .register-card::after {
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
      }
      /* 验证码组件底部区域保持透明，避免出现黑色底条 */
      html body .captcha,
      html body .captcha-container,
      html body .captcha-wrapper,
      html body .captcha-box,
      html body .captcha-image,
      html body .captcha-img,
      html body .captcha canvas,
      html body .captcha-container canvas,
      html body .captcha-wrapper canvas,
      html body [class*="captcha"],
      html body [id*="captcha"] {
        background-color: transparent !important;
        background-image: none !important;
        border-bottom-color: transparent !important;
        box-shadow: none !important;
      }
      html body .captcha::after,
      html body .captcha-container::after,
      html body .captcha-wrapper::after,
      html body .captcha-box::after,
      html body [class*="captcha"]::after,
      html body [id*="captcha"]::after {
        background: transparent !important;
        border-bottom: 0 !important;
        box-shadow: none !important;
      }
    `);

    // 页面给验证码按钮写入了 inline !important 深色背景；统一改为半透明白色填充，并移除边框。
    const normalizeAuthCaptcha = (root = document) => {
        const nodes = [];
        if (root.nodeType === 1 && root.matches?.('.auth-captcha')) nodes.push(root);
        if (root.querySelectorAll) nodes.push(...root.querySelectorAll('.auth-captcha'));
        for (const button of nodes) {
            const captchaFill = 'rgba(255, 255, 255, 0.65)';
            button.style.setProperty('background', captchaFill, 'important');
            button.style.setProperty('background-color', captchaFill, 'important');
            button.style.setProperty('border', 'none', 'important');
            button.style.setProperty('border-color', 'transparent', 'important');
            button.style.setProperty('outline', 'none', 'important');
            button.style.setProperty('box-shadow', 'none', 'important');
            button.style.setProperty('padding', '0', 'important');
            button.style.setProperty('line-height', '0', 'important');
            const img = button.querySelector('img');
            if (img) {
                img.style.setProperty('display', 'block', 'important');
                img.style.setProperty('background', 'transparent', 'important');
                img.style.setProperty('border', '0', 'important');
                img.style.setProperty('box-shadow', 'none', 'important');
            }
        }
    };
    normalizeAuthCaptcha();
    // 仅监听新增节点，不监听 style 属性：避免样式修改反复触发观察器。
    const authCaptchaObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes || []) {
                if (node.nodeType === 1) normalizeAuthCaptcha(node);
            }
        }
    });
    authCaptchaObserver.observe(document.documentElement, {
        subtree: true,
        childList: true
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && maskEl && maskEl.classList.contains('show')) {
            closeSettingsCard();
        }
    });
})();
