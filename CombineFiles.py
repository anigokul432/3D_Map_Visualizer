import os

# Define the directory containing the split files and the output file name
input_dir = 'Infosys_map_split'
output_dir = 'public/assets'
output_file = os.path.join(output_dir, 'infy_campus_v6.pcd')

# Ensure the output directory exists
os.makedirs(output_dir, exist_ok=True)

# List the split files in the correct order
split_files = [
    'infy_campus_v6.pcd.part1',
    'infy_campus_v6.pcd.part2',
    'infy_campus_v6.pcd.part3',
    'infy_campus_v6.pcd.part4',
    'infy_campus_v6.pcd.part5',
    'infy_campus_v6.pcd.part6',
    'infy_campus_v6.pcd.part7'
]

# Open the output file in write-binary mode
with open(output_file, 'wb') as outfile:
    # Iterate through each split file
    for filename in split_files:
        # Construct the full path to the split file
        file_path = os.path.join(input_dir, filename)
        
        # Open the split file in read-binary mode and write its contents to the output file
        with open(file_path, 'rb') as infile:
            outfile.write(infile.read())

print(f'Successfully combined split files into {output_file}')
