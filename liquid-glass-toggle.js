/* ============================================================
* LIQUID GLASS TOGGLE — iOS-тумблеры для настроек игры.
*
* В разметке остаётся настоящий <input type="checkbox"> (скрытый),
* поэтому весь существующий код настроек в script.js работает как раньше:
* он читает .checked и слушает событие "change".
*
* Разметка:
*   <div class="settings-checkbox">
*     <input type="checkbox" id="soundEnabled">
*     <div class="lg-track" data-toggle-for="soundEnabled">
*       <div class="knob"><span class="gloss"></span>...</div>
*     </div>
*     <label>Звук</label>
*   </div>
*
* API: window.LiquidGlassToggles.init(), window.syncLiquidToggles()
* ============================================================ */
(function (global) {
    'use strict';

    function getPoint(e) {
        if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        return { x: e.clientX, y: e.clientY };
    }

    // Реальная ширина у скрытого таба (display:none) равна нулю, поэтому
    // нужен запасной размер, иначе ручка уедет в непонятную точку.
    function safeMeasure(el, fallback) {
        var v = el ? el.offsetWidth : 0;
        return v > 0 ? v : fallback;
    }

    function Toggle(track, opts) {
        opts = opts || {};
        this.track = track;
        this.knob = track.querySelector('.knob');
        this.onChange = opts.onChange || null;
        if (!this.knob) { console.warn('LiquidGlass.Toggle: .knob не найден'); return; }
        var self = this;

        this.state = {
            pressProgress: 0, targetPress: 0,
            offset: { x: 0, y: 0 }, targetOffset: { x: 0, y: 0 },
            isPressed: false, rafId: null
        };
        this.toggle = {
            fraction: 0, target: 0, velocity: 0,
            dragging: false, on: !!opts.checked, dragDelta: 0
        };
        if (this.toggle.on) { this.toggle.fraction = 1; this.toggle.target = 1; track.classList.add('on'); }

        this.pill = { stretch: 0, targetStretch: 0, lastPointerX: 0, lastTime: 0, lastSpeed: 0 };

        this.SPRING = { k: 420, c: 34, m: 1 };
        this.PAD = 3;
        this.TRACK_W = 0; this.KNOB_W = 0; this.TRAVEL = 0;
        this.DRAG_LIMIT = 0;
        this.SCALE_GROW = 0.5;
        this.PILL_SPEED_DEAD = 320;
        this.PILL_SPEED_MAX = 1800;
        this.PILL_DECAY = 0.955;
        this.PILL_STRETCH_X = 0.42;
        this.PILL_SQUASH_Y = 0.20;
        this.PILL_FOLLOW = 16;

        this._measure();
        requestAnimationFrame(function () { self._measure(); self._apply(); });
        global.addEventListener('resize', function () { self._measure(); self._apply(); });

        // Тумблеры лежат в скрытых вкладках. Когда вкладка показывается,
        // размеры появляются из ниоткуда — ResizeObserver пересчитывает их,
        // иначе ручка стоит не на своём месте.
        if (global.ResizeObserver) {
            this._ro = new ResizeObserver(function () { self._measure(); self._apply(); });
            this._ro.observe(track);
        }

        this._last = performance.now();
        this._tick = function (now) {
            var dt = Math.min((now - self._last) / 1000, 0.033);
            self._last = now;
            var t = self.toggle, s = self.state, pl = self.pill;

            if (!t.dragging) {
                var dx = t.fraction - t.target;
                var a = (-self.SPRING.k * dx - self.SPRING.c * t.velocity) / self.SPRING.m;
                t.velocity += a * dt;
                t.fraction += t.velocity * dt;
                if (Math.abs(t.fraction - t.target) < 1e-4 && Math.abs(t.velocity) < 1e-3) {
                    t.fraction = t.target; t.velocity = 0;
                }
                t.dragDelta += (0 - t.dragDelta) * Math.min(1, dt * 20);
            }

            s.pressProgress += (s.targetPress - s.pressProgress) * 0.18;
            s.offset.x += (s.targetOffset.x - s.offset.x) * 0.22;
            s.offset.y += (s.targetOffset.y - s.offset.y) * 0.22;
            pl.stretch += (pl.targetStretch - pl.stretch) * Math.min(1, dt * self.PILL_FOLLOW);
            pl.targetStretch *= self.PILL_DECAY;
            if (Math.abs(pl.targetStretch) < 0.004) pl.targetStretch = 0;

            self._apply();

            var needContinue =
                Math.abs(s.targetPress - s.pressProgress) > 0.001 ||
                Math.abs(s.targetOffset.x - s.offset.x) > 0.1 ||
                Math.abs(s.targetOffset.y - s.offset.y) > 0.1 ||
                Math.abs(t.target - t.fraction) > 1e-4 ||
                Math.abs(t.velocity) > 1e-3 ||
                Math.abs(t.dragDelta) > 0.1 ||
                Math.abs(pl.stretch) > 0.004 ||
                Math.abs(pl.targetStretch) > 0.004;

            if (needContinue || s.isPressed || t.dragging) {
                s.rafId = requestAnimationFrame(self._tick);
            } else {
                s.pressProgress = s.targetPress;
                s.offset.x = s.targetOffset.x;
                s.offset.y = s.targetOffset.y;
                t.fraction = t.target; t.velocity = 0; t.dragDelta = 0;
                pl.stretch = 0; pl.targetStretch = 0;
                self._apply();
                s.rafId = null;
            }
        };
        this._start = function () { if (self.state.rafId == null) self.state.rafId = requestAnimationFrame(self._tick); };
        this._bind();
        this._apply();
    }

    Toggle.prototype._measure = function () {
        // Запасные размеры должны совпадать с CSS (.lg-track 64x28, .knob 39x22),
        // иначе при измерении в скрытой вкладке ручка встанет не на своё место.
        this.TRACK_W = safeMeasure(this.track, 64);
        this.KNOB_W = safeMeasure(this.knob, 39);
        this.TRAVEL = Math.max(1, this.TRACK_W - this.PAD * 2 - this.KNOB_W);
    };

    Toggle.prototype._apply = function () {
        if (!this.knob) return;
        var knob = this.knob;
        var w = knob.offsetWidth || 39;
        var h = knob.offsetHeight || 22;
        var minDim = Math.min(w, h);
        var s = this.state, t = this.toggle, pl = this.pill;
        var progress = s.pressProgress;
        var baseScale = 1 + this.SCALE_GROW * progress;
        var st = pl.stretch * progress;
        var absS = Math.abs(st);
        var scaleX = baseScale + absS * this.PILL_STRETCH_X;
        var scaleY = baseScale - absS * this.PILL_SQUASH_Y;
        var originX = 50 + st * 30;
        var maxOffset = minDim;
        var tx = maxOffset * Math.tanh(0.05 * s.offset.x / maxOffset);
        var ty = maxOffset * Math.tanh(0.05 * s.offset.y / maxOffset);
        var baseX = this.PAD + t.fraction * this.TRAVEL;
        var finalX = baseX + t.dragDelta;
        var minX = this.PAD - this.DRAG_LIMIT;
        var maxX = this.PAD + this.TRAVEL + this.DRAG_LIMIT;
        if (finalX < minX) finalX = minX;
        if (finalX > maxX) finalX = maxX;
        var offsetX = finalX - this.PAD;
        knob.style.transformOrigin = originX + '% 50%';
        knob.style.transform =
            'translate3d(' + (offsetX + tx) + 'px,' + ty + 'px,0) ' +
            'scale(' + scaleX + ',' + scaleY + ')';
        knob.style.setProperty('--lx', (50 + (s.offset.x / w) * 100) + '%');
        knob.style.setProperty('--ly', (50 + (s.offset.y / h) * 100) + '%');
    };

    Toggle.prototype._bind = function () {
        var self = this;
        var track = this.track;
        var knob = this.knob;
        var pid = null, startX = 0, startF = 0, moved = false;

        function onDown(e, isKnob) {
            if (pid !== null) return;
            pid = e.pointerId;
            try { (isKnob ? knob : track).setPointerCapture(pid); } catch (_) {}
            self.state.isPressed = true;
            self.state.targetPress = 1;
            knob.classList.add('is-active');
            if (navigator.vibrate) { try { navigator.vibrate(8); } catch (_) {} }
            self._updateOffset(e);
            self._spawnRipple(e);
            self.toggle.dragging = true;
            self.toggle.velocity = 0;
            self.toggle.dragDelta = 0;
            startX = e.clientX;
            startF = self.toggle.fraction;
            moved = false;
            self.pill.lastPointerX = e.clientX;
            self.pill.lastTime = performance.now();
            self.pill.lastSpeed = 0;
            self.pill.stretch = 0;
            self.pill.targetStretch = 0;
            self._start();
            e.preventDefault();
        }

        knob.addEventListener('pointerdown', function (e) { onDown(e, true); });
        track.addEventListener('pointerdown', function (e) {
            if (e.target === knob || knob.contains(e.target)) return;
            onDown(e, false);
        });

        function onMove(e) {
            if (e.pointerId !== pid) return;
            self._updateOffset(e);
            var dx = e.clientX - startX;
            if (Math.abs(dx) > 2) moved = true;
            var t = self.toggle;
            var f = startF + dx / self.TRAVEL;
            f = Math.max(0, Math.min(1, f));
            t.fraction = f; t.target = f; t.velocity = 0;
            var desiredX = startF * self.TRAVEL + dx;
            var allowedX = t.fraction * self.TRAVEL;
            t.dragDelta = desiredX - allowedX;
            if (t.dragDelta > self.DRAG_LIMIT) t.dragDelta = self.DRAG_LIMIT;
            if (t.dragDelta < -self.DRAG_LIMIT) t.dragDelta = -self.DRAG_LIMIT;
            var nowOn = f >= 0.5;
            if (nowOn !== t.on) { t.on = nowOn; track.classList.toggle('on', nowOn); }

            var p = getPoint(e);
            var now = performance.now();
            var dtMs = now - self.pill.lastTime;
            if (dtMs < 1) dtMs = 1;
            var instDx = p.x - self.pill.lastPointerX;
            var speed = (instDx / dtMs) * 1000;
            self.pill.lastPointerX = p.x;
            self.pill.lastTime = now;
            self.pill.lastSpeed = speed;
            var absSpeed = Math.abs(speed);
            var targetMagnitude = 0;
            if (absSpeed > self.PILL_SPEED_DEAD) {
                var tt = (absSpeed - self.PILL_SPEED_DEAD) / (self.PILL_SPEED_MAX - self.PILL_SPEED_DEAD);
                if (tt > 1) tt = 1;
                targetMagnitude = Math.tanh(tt * 2.4) / Math.tanh(2.4);
            }
            var dir = speed >= 0 ? 1 : -1;
            var newTarget = dir * targetMagnitude;
            self.pill.targetStretch = self.pill.targetStretch * 0.5 + newTarget * 0.5;
            if (self.pill.targetStretch > 1) self.pill.targetStretch = 1;
            if (self.pill.targetStretch < -1) self.pill.targetStretch = -1;
            self._start();
            e.preventDefault();
        }

        function finish(e) {
            if (e.pointerId !== pid) return;
            try { knob.releasePointerCapture(pid); } catch (_) {}
            try { track.releasePointerCapture(pid); } catch (_) {}
            pid = null;
            self.state.isPressed = false;
            self.state.targetPress = 0;
            self.state.targetOffset.x = 0;
            self.state.targetOffset.y = 0;
            knob.classList.remove('is-active');
            var t = self.toggle;
            t.dragging = false;
            if (moved) { t.target = t.fraction >= 0.5 ? 1 : 0; t.on = t.target === 1; }
            else { t.on = !t.on; t.target = t.on ? 1 : 0; }
            track.classList.toggle('on', t.on);
            if (self.onChange) self.onChange(t.on, self);
            self._start();
        }

        global.addEventListener('pointermove', onMove, { passive: false });
        global.addEventListener('pointerup', finish);
        global.addEventListener('pointercancel', finish);

        // Доступность с клавиатуры: пробел/Enter и стрелки.
        knob.setAttribute('tabindex', '0');
        knob.addEventListener('keydown', function (e) {
            var t = self.toggle;
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                t.on = !t.on; t.target = t.on ? 1 : 0;
                track.classList.toggle('on', t.on);
                if (self.onChange) self.onChange(t.on, self);
                self._start();
            } else if (e.key === 'ArrowRight') {
                t.on = true; t.target = 1; track.classList.add('on'); self._start();
                if (self.onChange) self.onChange(t.on, self);
            } else if (e.key === 'ArrowLeft') {
                t.on = false; t.target = 0; track.classList.remove('on'); self._start();
                if (self.onChange) self.onChange(t.on, self);
            }
        });
    };

    Toggle.prototype._updateOffset = function (e) {
        var knob = this.knob;
        var rect = knob.getBoundingClientRect();
        var p = getPoint(e);
        var mx = rect.left + rect.width / 2;
        var my = rect.top + rect.height / 2;
        var maxOff = Math.max(rect.width, rect.height) * 0.6;
        var dx = p.x - mx, dy = p.y - my;
        var len = Math.hypot(dx, dy);
        if (len > maxOff) { dx = dx / len * maxOff; dy = dy / len * maxOff; }
        this.state.targetOffset.x = dx;
        this.state.targetOffset.y = dy;
    };

    Toggle.prototype._spawnRipple = function (e) {
        var layer = this.knob.querySelector('.ripple-layer');
        if (!layer) return;
        var rect = this.knob.getBoundingClientRect();
        var p = getPoint(e);
        var r = document.createElement('span');
        r.className = 'ripple';
        r.style.left = (p.x - rect.left) + 'px';
        r.style.top = (p.y - rect.top) + 'px';
        layer.appendChild(r);
        setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 600);
    };

    // Меняет состояние программно и вызывает onChange (как по клику).
    Toggle.prototype.set = function (v) {
        var t = this.toggle;
        t.on = !!v; t.target = t.on ? 1 : 0;
        this.track.classList.toggle('on', t.on);
        if (this.onChange) this.onChange(t.on, this);
        this._start();
    };

    // Только внешний вид, без onChange: для синхронизации с сохранёнными настройками.
    Toggle.prototype.render = function (v) {
        var t = this.toggle;
        t.on = !!v; t.target = t.on ? 1 : 0; t.velocity = 0;
        this.track.classList.toggle('on', t.on);
        this._start();
    };

    /* ============================================================
    * Привязка тумблеров к чекбоксам настроек
    * ============================================================ */
    var instances = [];

    function bindTrack(track) {
        var inputId = track.getAttribute('data-toggle-for');
        var input = inputId ? document.getElementById(inputId) : null;
        // Разрешаем и короткую форму: <div class="lg-track" id="..."> внутри label
        // для чекбокса с другим id не нужна — привязка только по data-toggle-for.
        var toggle = new Toggle(track, { checked: input ? !!input.checked : false });
        if (input) {
            toggle.onChange = function (on) {
                // Пишем в настоящий чекбокс и отправляем "change" —
                // обработчики настроек в script.js отрабатывают как раньше.
                if (input.checked !== on) {
                    input.checked = on;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            };
            // Клик по подписи (label for=...) переключает скрытый чекбокс
            // напрямую — подтягиваем за ним внешний вид тумблера.
            input.addEventListener('change', function () { toggle.render(input.checked); });
        }
        track._liquidToggle = toggle;
        instances.push({ track: track, input: input, toggle: toggle });
    }

    function init(root) {
        root = root || document;
        root.querySelectorAll('.lg-track[data-toggle-for]').forEach(function (track) {
            if (track._liquidToggle) return;   // защита от повторной инициализации
            bindTrack(track);
        });
        syncAll();
    }

    // Синхронизация визуала с input.checked (настройки могли загрузиться позже).
    function syncAll() {
        instances.forEach(function (item) {
            if (!item.input) return;
            item.toggle.render(item.input.checked);
        });
    }

    global.LiquidGlassToggles = { Toggle: Toggle, init: init, sync: syncAll };
    global.syncLiquidToggles = syncAll;

    function boot() {
        try { init(document); } catch (e) { console.warn('LiquidGlassToggles init error:', e); }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})(window);
