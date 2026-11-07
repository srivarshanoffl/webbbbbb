from PIL import Image

im = Image.open(r'c:\Users\sriva\strange portals\three-lost-relics\assets\characters\strange_pngmart.png')
w, h = im.size
print(f"Total size: {w} x {h}")

# The head is roughly top 50 to 350
# The left hand (viewer's top right) is roughly x: 700-950, y: 150-350
# The right hand (viewer's middle left) is roughly x: 250-450, y: 700-950
# The Eye of Agamotto is roughly x: 600-700, y: 550-650
# Let's crop and verify each region
im.crop((680, 150, 950, 380)).save(r'c:\Users\sriva\strange portals\three-lost-relics\assets\characters\hand_left_check.png')
im.crop((230, 700, 470, 960)).save(r'c:\Users\sriva\strange portals\three-lost-relics\assets\characters\hand_right_check.png')
im.crop((550, 520, 720, 680)).save(r'c:\Users\sriva\strange portals\three-lost-relics\assets\characters\eye_check.png')
print("Saved crops for verification!")

