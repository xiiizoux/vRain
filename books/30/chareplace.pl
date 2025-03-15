#!/usr/bin/perl
#by shanleiguang@gmail.com, 2025
use strict;
use warnings;

use Getopt::Std;
use Encode;
use utf8;

binmode(STDIN, ':encoding(utf8)');
binmode(STDOUT, ':encoding(utf8)');
binmode(STDERR, ':encoding(utf8)');

my %opts;

getopts('f:t:', \%opts);

my $from = $opts{'f'} ? $opts{'f'} : 1;
my $to = $opts{'t'} ? $opts{'t'} : 1;
my %rchars; #保存替换字符

open RTXT, '< replace.txt';
while(<RTXT>) {
	chomp;
	$_ = decode('utf-8', $_);
	my @tmp = split /\|/, $_;
	if($tmp[3]) {
		$rchars{$tmp[0]} = $tmp[3];
	}
}
close(RTXT);

opendir TBADIR, "text_ba";
foreach my $tfn (sort readdir(TBADIR)) {
	next if($tfn !~ m/\.txt$/i);
	my ($content, @chars);
	print "replacing 'text_ba/$tfn' ... \n";
	open TEXTBA, "< text_ba/$tfn";
	{ local $/ = undef; $content = <TEXTBA>; }
	close(TEXTBA);
	$content = decode('utf-8', $content);
	foreach my $from (keys %rchars) {
		my $to = $rchars{$from};
		$content =~ s/$from/$to/g;
	}
	open TEXT, "> text/$tfn";
	print TEXT $content;
	close(TEXT);
}
close(TBADIR);
