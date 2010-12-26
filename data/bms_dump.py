#!/usr/bin/python
# vim: fileencoding=utf-8:
from bms import BMS

import sys, getopt, json

def usage():
    """print usage"""
    print """Usage: 
    -d:
        debug
    -i, --input:
        input file path
    -o, --output:
        output file path
    -h, --help:
        print this help
    """
    pass

def main(argv):

    _debug = False
    _input = _output = ''
    try:
        opts, args = getopt.getopt(argv, 'hi:o:d', ['help', 'input=', 'output='])
    except getopt.GetoptError:
        usage()
        sys.exit(2)

    for opt, arg in opts:
        if opt in ('-h', '--help'):
            usage()
            sys.exit()
        elif opt in ('-d'):
            _debug = True
        elif opt in ('-i', '--input'):
            _input = arg
        elif opt in ('-o', '--output'):
            _output = arg

    bms = BMS().parse(_input)
    output = json.dumps({
        'header': bms.header,
        'define': bms.define,
        'body': bms.body
    })
    if _debug:
        print output

    o = open(_output, 'w')
    o.write(output)
    o.close()

if __name__ == '__main__':
    main(sys.argv[1:])
