import os
import json
from PIL import Image

# Final size of the sheet
width = 160
height = 160

# Edit these folders to whatever you want
input_folder = 'assets_src'
output_folder = 'static/img'

# Get all files in the folder and sort them
files = sorted(os.listdir(input_folder))

output_image = Image.new('RGBA', (width, height), (255, 255, 255, 0))
output_object = {}

x = 0
y = 0
highest = 0

fitters = []

for file in files:
    if file.endswith('.png') and not file.startswith('#'):
        img = Image.open(input_folder + '/' + file)

        name = file.replace('.png', '')

        # If no more space is available, go to the next line
        if x + img.size[0] > width:
            fitter = {"x": x, "y": y, "w": width - x, "h": highest}
            fitters.append(fitter)

            x = 0
            y += highest

        # The highest image of the row decides how much y is added when the row ends
        if img.size[1] > highest:
            highest = img.size[1]

        # Paste the image at a fitter if available
        foundspot = False
        for fitter in fitters:
            if img.size[0] <= fitter["w"] and img.size[1] <= fitter["h"] and not foundspot:
                foundspot = True
                output_image.paste(img, (fitter["x"], fitter["y"]))
                output_object[name] = {"x": fitter["x"], "y": fitter["y"], "w": img.size[0], "h": img.size[1]}

                fitter["y"] += img.size[1]
                fitter["h"] -= img.size[1]

        # Just paste at the usual spot
        if not foundspot:
            output_image.paste(img, (x, y))
            output_object[name] = {"x": x, "y": y, "w": img.size[0], "h": img.size[1]}

            # Give unused space to the fitters
            if img.size[1] < highest:
                fitters.append({"x": x, "y": y + img.size[1], "w": img.size[0], "h": highest - img.size[1]})

            # Move right
            x += img.size[0]

# Save png to output folder
output_image.save(output_folder + '/0.png', 'PNG', optimize=True)

# Save json to output folder
with open(output_folder + '/0.json', 'w') as j:
    # j.write(json.dumps(output_object, indent = 4))
    j.write(json.dumps(output_object).replace(' ',''))
    j.close()
