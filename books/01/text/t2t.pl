#!/usr/bin/perl
#by shanleiguang, 2024.1.5
use strict;
use warnings;

use Encode;
use utf8;
use Getopt::Std;

my %opts;

getopts('p:', \%opts);

my $row_num = 24;
my ($content, $text);

open TMP, "< $opts{p}.tmp";

while(<TMP>) {
	chomp;
	$_ = decode('utf-8', $_);
	s/、|，|。|；|：|！|？|「|」|『|』|《|》/。/g;
	s/。+/。/g;
	s/^。//;
	my ($rflag, $cnt) = (0, 0);
	if(m/^S(\d)(.*?)$/) {
		my $snum = $1;
		my $line = $2;
		my @lchars = split //, $line;
		my @nchars;
		while(scalar @lchars > 0) {
			my $lchar = shift @lchars;
			if($lchar eq '【') {
				push @nchars, $lchar;
				$rflag = 1;
				next;
			}
			if($lchar eq '】') {
				push @nchars, $lchar;
				$rflag = 0;
				$cnt = int($cnt+0.5);
				next;
			}
			if($lchar eq '。') {
				push @nchars, $lchar;
				next;
			}
			$cnt++ if($rflag == 0);
			$cnt+= 0.5 if($rflag == 1);

			if($rflag == 0) {
				if($cnt == 1) {
					push @nchars, '@'x$snum.$lchar;
				} else {
					if($cnt <= $row_num-$snum) {
						push @nchars, $lchar;
					} else {
						unshift @lchars, $lchar;
						$cnt = 0;
					}
				}
			}
			if($rflag == 1) {
				if($cnt == 0.5) {
					push @nchars, '@@'x$snum.'】【'.$lchar;
				} else {
					if(int($cnt+0.5) <= $row_num-$snum) {
						push @nchars, $lchar;
					} else {
						unshift @lchars, $lchar;
						$cnt = 0;
					}
				}
			}
		}
		$_ = join '', @nchars;

	}
	$text.= "$_\n";
}

close(TMP);


open TEXT, "> $opts{p}.txt";
print TEXT $text;
close(TEXT);

sub get_digital_zh {
	my $d = shift;
	my @chars_zh = ('〇', '一', '二', '三', '四', '五', '六', '七', '八', '九');
	$d =~ s/(\d)/$chars_zh[$1]/g;
	return $d;
}
