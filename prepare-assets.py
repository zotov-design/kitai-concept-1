from pathlib import Path
from PIL import Image

assets = Path(__file__).parent / 'dist' / 'assets'
targets = {'img': (2400, 90), 'img2': (700, 88), 'img3': (1200, 87),
           'imgFrame31451': (1300, 87), 'imgFrame31452': (1300, 87),
           'imgFrame31453': (1300, 87),
           'imgMagnificCreateOnePremiumPhotorealisticTravelAdvertisi440332': (1400, 85)}
for name, (width, quality) in targets.items():
    source = Image.open(assets / f'{name}.png')
    source.thumbnail((width, width * 2))
    source.save(assets / f'{name}.webp', 'WEBP', quality=quality, method=6)
    print(name, source.size, (assets / f'{name}.webp').stat().st_size)
