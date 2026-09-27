/*
	Szkoła Rocka — dodatkowa logika ponad Spectral (HTML5 UP).
	Świadomie NIE ma tu własnego reveal-on-scroll — poprzednia wersja strony
	miała sekcje trwale zablokowane na opacity:0, bo własny IntersectionObserver
	się nie odpalał. Spectral pokazuje treść od razu, więc ten błąd tu nie
	może się powtórzyć.
*/

(function () {
	'use strict';

	// ---- zdejmij is-preload wcześniej niż robi to Spectral (main.js) ----
	// main.js (oryginalny, nieruszany) zdejmuje klasę "is-preload" dopiero na
	// window.load + 100ms, czyli po ściągnięciu WSZYSTKICH nielazy obrazów na
	// stronie (kadra, "jak to działa", "o nas" - kilkanaście zdjęć). Dopóki ta
	// klasa wisi, nagłówek hero ma opacity:0 (main.css, reguły body.is-preload
	// #banner h2) - czyli LCP tekstu czeka na obrazy, z którymi nie ma nic
	// wspólnego. Zdejmujemy klasę tu, od razu jak DOM jest gotowy (CSS w <head>
	// już się wtedy załadował, więc nie ma ryzyka FOUC) - main.js i tak spróbuje
	// zrobić to samo później, ale removeClass na już nieobecnej klasie jest
	// nieszkodliwym no-opem.
	document.body.classList.remove('is-preload');

	// ---- lazy YouTube (fasada, bez ciężkiego iframe do czasu kliknięcia) ----
	document.querySelectorAll('.yt').forEach(function (el) {
		var id = el.dataset.id;
		var title = el.dataset.title || 'Wideo';

		var b = document.createElement('button');
		b.type = 'button';
		b.className = 'yt-face';
		b.setAttribute('aria-label', 'Odtwórz: ' + title);
		b.innerHTML =
			'<img loading="lazy" src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="">' +
			'<span class="play" aria-hidden="true"></span>';

		b.addEventListener('click', function () {
			var f = document.createElement('iframe');
			f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
			f.title = title;
			f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
			f.allowFullscreen = true;
			el.replaceChild(f, b);
		});

		el.appendChild(b);
	});

	// ---- lazy Facebook (fasada — iframe ładuje się dopiero po kliknięciu,
	// żeby nigdy nie pokazać pustej/martwej ramki od razu przy wejściu na stronę) ----
	document.querySelectorAll('.fb-wrap[data-href]').forEach(function (el) {
		var href = el.dataset.href;
		var title = el.dataset.title || 'Wideo';
		var face = el.querySelector('.fb-face');
		if (!face) {
			return;
		}

		face.addEventListener('click', function () {
			var f = document.createElement('iframe');
			f.src =
				'https://www.facebook.com/plugins/video.php?height=560&href=' +
				encodeURIComponent(href) +
				'&show_text=false&width=315&t=0';
			f.title = title;
			f.allow = 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
			f.allowFullscreen = true;
			f.style.border = 'none';
			el.replaceChild(f, face);
		});
	});

	// ---- formularz zapisów: wysyłka przez Formspree (fetch), bez przekierowania ----
	// Endpoint podpięty 2026-09-01 (dostarczony przez klienta). Przechwytujemy
	// submit i wysyłamy fetch()-em, żeby zostać na stronie i pokazać komunikat
	// zamiast przekierowywać na generyczną stronę potwierdzenia Formspree.
	var form = document.getElementById('signup-form');
	if (form) {
		form.addEventListener('submit', function (e) {
			e.preventDefault();

			if (!form.reportValidity()) {
				return;
			}

			var note = form.querySelector('.form-note');
			var submitBtn = form.querySelector('input[type="submit"]');

			if (submitBtn) {
				submitBtn.disabled = true;
			}

			fetch(form.action, {
				method: 'POST',
				body: new FormData(form),
				headers: { Accept: 'application/json' }
			})
				.then(function (response) {
					if (note) {
						if (response.ok) {
							note.textContent = 'Dziękujemy! Zgłoszenie zostało wysłane — oddzwonimy i dopasujemy Cię do zespołu.';
							form.reset();
						} else {
							note.textContent = 'Coś poszło nie tak przy wysyłce. Napisz bezpośrednio na fundacja@szkolarocka.pl albo zadzwoń pod +48 694 559 479.';
						}
						note.classList.add('is-visible');
					}
				})
				.catch(function () {
					if (note) {
						note.textContent = 'Coś poszło nie tak przy wysyłce. Napisz bezpośrednio na fundacja@szkolarocka.pl albo zadzwoń pod +48 694 559 479.';
						note.classList.add('is-visible');
					}
				})
				.finally(function () {
					if (submitBtn) {
						submitBtn.disabled = false;
					}
				});
		});
	}
})();
