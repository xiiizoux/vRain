
use Getopt::Std;
use Encode;
use utf8;

my %opts;

getopts('p:', \%opts);

my $pid = $opts{'p'};

my $hfn = "$pid.html";
my $tfn = "$pid.tmp";
my ($content, $text);

#[一|二|三|四|五|六|七|八|九|十]
#[１|２|３|４|５|６|７|８|９|０]

open HTML, "< $hfn";
{ local $/ = undef; $content = <HTML>; }
close(HTML);
$content = decode('utf-8', $content);
$content =~ s/\n|　//g;
#$content =~ s/<span class="text-label-inverse">.*?<\/span>//g;
#$content =~ s/<span class="inlinecomment">.*?<\/span>//g;
$content =~ s/<span id="lib.*?" class="libtarget">.*?<\/span>//g;
my $h2;

if($content =~ m{<h2 .*?>(.*?)<\/h2>}) {
	$h2 = $1;
	$h2 =~ s/<.*?>//g;
	$h2 =~ s/\[查看正文\] \[修改\] \[查看歷史\]//;
}
while($content =~ m{<tr.*?>(.*?)</tr>}g) {
	my $tr = $1;
	my $td;
	while($tr =~ m{<td class="ctext">(.*?)</td>}g) {
		$td.= $1;
	}
	$td =~ s/<span class="text-label-inverse">(.*?)<\/span>/【$1】/g;
	$td =~ s/<span class="inlinecomment">(.*?)<\/span>/【$1】/g;
	$td =~ s/<.*?>//g;
	$text.= "$td\n";
}

$text =~ s/^\%//;
open TEXT, "> $tfn";
print TEXT $h2."\n".$text;
close(TEXT);