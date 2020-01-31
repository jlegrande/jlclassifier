import json
import os
from collections import OrderedDict

images = {}
for path in ('images/compost', 'images/recycling', 'images/trash'):
    dirname = os.path.basename(path)
    images[dirname] = []
    for idx, filename in enumerate(os.listdir(path)):
        newname = os.path.join('.', path, '%s.%d.jpg' % (dirname, idx))
        images[dirname].append(newname)
        os.rename(os.path.join(path, filename), newname)

d = OrderedDict(images.items(), key=lambda item: item[0])
print dict(d)
