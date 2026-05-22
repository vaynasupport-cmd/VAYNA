from PIL import Image

def crop_white_borders(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    data = img.load()
    
    width, height = img.size
    
    min_x = width
    min_y = height
    max_x = 0
    max_y = 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = data[x, y]
            # Consider a pixel non-white if its not purely white or near white, or if it's transparent
            if a > 0 and not (r > 240 and g > 240 and b > 240):
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
                
    if min_x < max_x and min_y < max_y:
        # Add a tiny padding of 2%
        padding = int(min(width, height) * 0.02)
        min_x = max(0, min_x - padding)
        min_y = max(0, min_y - padding)
        max_x = min(width, max_x + padding)
        max_y = min(height, max_y + padding)
        
        cropped = img.crop((min_x, min_y, max_x, max_y))
        cropped.save(output_path)
        print("Cropped successfully!")
    else:
        print("Could not find bounds.")

if __name__ == "__main__":
    crop_white_borders("public/vayna-logo.png", "public/vayna-logo-cropped.png")
